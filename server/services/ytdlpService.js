import fs from "fs";
import path from "path";
import ytdlp from "yt-dlp-exec";
import { createRequire } from "module";
import { spawn } from "child_process";

import { getJob, deleteJob } from "../models/jobStore.js";
import { createProgressSink, applyProgressLine } from "../utils/progress.js";
import {
  appendJobLog,
  classifyYtdlpFailure,
  nowIso,
  tailText,
  writeJobStderr,
} from "../utils/jobLogger.js";

// 오디오 임시 파일 보관 시간(기본 24시간).
// NOTE: `/youtube/jobs/:jobId/audio` 요청으로 TTL을 갱신(연장)하지 않는다.
const AUDIO_TTL_MS = 24 * 60 * 60 * 1000;

const require = createRequire(import.meta.url);
/** @type {{ YOUTUBE_DL_PATH?: string }} */
const ytdlpConstants = (() => {
  try {
    return require("yt-dlp-exec/src/constants.js");
  } catch {
    return {};
  }
})();

const YT_DLP_PATH = ytdlpConstants.YOUTUBE_DL_PATH ?? null;
let ytdlpUpdated = false;

function updateYtDlpBinaryOnce() {
  if (ytdlpUpdated) return;
  if (!YT_DLP_PATH) return;
  ytdlpUpdated = true;

  try {
    const p = spawn(YT_DLP_PATH, ["-U"], {
      stdio: "ignore",
      windowsHide: true,
    });
    p.on("error", (e) => console.error(e));
  } catch (e) {
    console.error(e);
  }
}

const cookiesFromBrowser =
  typeof process.env.YTDLP_COOKIES_FROM_BROWSER === "string" &&
  process.env.YTDLP_COOKIES_FROM_BROWSER.trim()
    ? process.env.YTDLP_COOKIES_FROM_BROWSER.trim()
    : null;

const ytdlpDefaultFlags = {
  impersonate: "chrome:windows-10",
  extractorArgs: "youtube:player_client=android",
};

/**
 * @param {string} jobId
 */
function scheduleJobCleanup(jobId) {
  const job = getJob(jobId);
  if (!job || !job.outputPath) return;
  const out = job.outputPath;
  const cleanupAt = Date.now() + AUDIO_TTL_MS;
  job.cleanupAt = cleanupAt;

  setTimeout(() => {
    const j = getJob(jobId);
    if (!j) return;
    if (j.cleanupAt !== cleanupAt) return;
    const fp = j.outputPath;
    deleteJob(jobId);
    if (!fp) return;
    fs.unlink(fp, () => {});
  }, AUDIO_TTL_MS + 1000);
}

/**
 * @param {string} jobId
 * @param {string} videoUrl
 */
export async function runYoutubeJob(jobId, videoUrl) {
  const job = getJob(jobId);
  if (!job) return;

  updateYtDlpBinaryOnce();

  const startedAt = Date.now();
  job.status = "running";
  job.stage = "starting";
  job.percent = 0;

  const relativeOut = path.join("temp", `${jobId}.mp3`);
  const outputPath = path.resolve(relativeOut);
  job.outputPath = outputPath;

  let stderrAll = "";
  let lastLoggedPercent = -1;

  await appendJobLog(jobId, {
    ts: nowIso(),
    level: "info",
    event: "job_start",
    jobId,
    url: videoUrl,
    outputPath: relativeOut,
    flags: {
      ...ytdlpDefaultFlags,
      ...(cookiesFromBrowser ? { cookiesFromBrowser: "[set]" } : {}),
    },
  });

  try {
    try {
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    } catch (e) {
      console.error(e);
      throw new Error("Failed to prepare temp directory");
    }

    const subprocess = ytdlp.exec(
      videoUrl,
      {
        noPlaylist: true,
        format: "bestaudio/best",
        concurrentFragments: 4,
        extractAudio: true,
        audioFormat: "mp3",
        output: outputPath,
        newline: true,
        progress: true,
        progressTemplate: [
          "download:DL|%(progress._percent)s|%(progress.status)s",
          "postprocess:PP|%(progress._percent)s|%(progress.status)s",
        ],
        progressDelta: 0.35,
        ...ytdlpDefaultFlags,
        ...(cookiesFromBrowser ? { cookiesFromBrowser } : {}),
      },
      {
        buffer: false,
        reject: false,
      },
    );

    const sink = createProgressSink(
      (line) => {
        const j = getJob(jobId);
        if (!j) return;
        applyProgressLine(j, line);
      },
      (pct) => {
        const j = getJob(jobId);
        if (!j) return;
        j.percent = Math.min(95, Math.max(j.percent, Math.round(pct)));
        const p = j.percent;
        if (p >= 0 && p <= 100) {
          // avoid spamming logs: only log every 5% (and always log first update)
          const bucket = Math.floor(p / 5) * 5;
          if (bucket !== lastLoggedPercent) {
            lastLoggedPercent = bucket;
            void appendJobLog(jobId, {
              ts: nowIso(),
              level: "info",
              event: "job_progress",
              jobId,
              percent: p,
              stage: j.stage,
            });
          }
        }
      },
    );

    const onData = (c) => {
      const s = c.toString();
      stderrAll += s;
      sink(s);
    };

    subprocess.stdout?.on("data", onData);
    subprocess.stderr?.on("data", onData);

    const result = await subprocess;

    if (result.exitCode !== 0) {
      const stderrTail = tailText(stderrAll.trim(), 2000);
      const msg =
        stderrTail || `yt-dlp exited with code ${result.exitCode ?? "unknown"}`;
      const errorType = classifyYtdlpFailure(stderrAll);
      await appendJobLog(jobId, {
        ts: nowIso(),
        level: "error",
        event: "job_failed",
        jobId,
        url: videoUrl,
        exitCode: result.exitCode ?? null,
        errorType,
        message: msg,
        stderrTail,
        elapsedMs: Date.now() - startedAt,
      });
      await writeJobStderr(jobId, stderrAll);
      throw new Error(msg);
    }

    try {
      await fs.promises.access(outputPath, fs.constants.R_OK);
    } catch {
      throw new Error("Output file was not created");
    }

    job.percent = 100;
    job.status = "done";
    job.stage = "complete";
    await appendJobLog(jobId, {
      ts: nowIso(),
      level: "info",
      event: "job_done",
      jobId,
      url: videoUrl,
      outputPath: relativeOut,
      elapsedMs: Date.now() - startedAt,
    });
    scheduleJobCleanup(jobId);
  } catch (error) {
    console.error(error);
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Conversion failed";
    job.percent = 0;
    const stderrTail = tailText(stderrAll.trim(), 2000);
    await appendJobLog(jobId, {
      ts: nowIso(),
      level: "error",
      event: "job_error",
      jobId,
      url: videoUrl,
      errorType: classifyYtdlpFailure(stderrAll),
      message: job.error,
      stderrTail,
      elapsedMs: Date.now() - startedAt,
    });
    await writeJobStderr(jobId, stderrAll);

    try {
      if (job.outputPath) {
        await fs.promises.unlink(job.outputPath).catch(() => {});
      }
    } catch {
      // ignore
    }
    job.outputPath = null;
  }
}
