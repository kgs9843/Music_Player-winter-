// server/server.js
import dotenv from "dotenv";
import express from "express";
import ytdlp from "yt-dlp-exec";
import cors from "cors";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createRequire } from "module";
import { spawn } from "child_process";

dotenv.config();

const app = express();
const defaultAllowedOrigins = ["http://localhost:5173"];
const allowedOrigins = (() => {
  const raw =
    typeof process.env.ALLOWED_ORIGINS === "string"
      ? process.env.ALLOWED_ORIGINS.trim()
      : "";
  if (!raw) return defaultAllowedOrigins;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
})();

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) may omit Origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS: origin not allowed"));
    },
  }),
);
app.use(express.json({ limit: "32kb" }));

/** @typedef {{ status: string, percent: number, stage: string, error: string | null, outputPath: string | null, cleanupAt: number | null }} Job */

/** @type {Map<string, Job>} */
const jobs = new Map();

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
  const job = jobs.get(jobId);
  if (!job || !job.outputPath) return;
  const out = job.outputPath;
  const cleanupAt = Date.now() + AUDIO_TTL_MS;
  job.cleanupAt = cleanupAt;

  setTimeout(() => {
    const j = jobs.get(jobId);
    if (!j) return;
    if (j.cleanupAt !== cleanupAt) return;
    const fp = j.outputPath;
    jobs.delete(jobId);
    if (!fp) return;
    fs.unlink(fp, () => {});
  }, AUDIO_TTL_MS + 1000);
}

/**
 * @param {(line: string) => void} onLine
 * @param {(pct: number) => void} onPercent
 */
function createProgressSink(onLine, onPercent) {
  let buf = "";
  return (chunk) => {
    buf += typeof chunk === "string" ? chunk : chunk.toString();
    const parts = buf.split("\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const t = part.trim();
      if (t.startsWith("DL|") || t.startsWith("PP|")) {
        onLine(t);
      }
      const m = /(\d{1,3}(?:\.\d+)?)\s*%/.exec(t);
      if (m) {
        const p = Number(m[1]);
        if (Number.isFinite(p)) onPercent(p);
      }
    }
  };
}

/**
 * @param {Job} job
 * @param {string} line — `DL|percent|status` 또는 `PP|percent|status` (status에 `|` 포함 가능)
 */
function applyProgressLine(job, line) {
  if (line.startsWith("DL|")) {
    const rest = line.slice(3);
    const sep = rest.indexOf("|");
    const pRaw = sep === -1 ? rest : rest.slice(0, sep);
    const status = sep === -1 ? "" : rest.slice(sep + 1);
    const p = Number(pRaw);
    if (Number.isFinite(p)) {
      job.percent = Math.min(95, Math.max(0, Math.round(p)));
    }
    if (status) job.stage = status;
    return;
  }
  if (line.startsWith("PP|")) {
    const rest = line.slice(3);
    const sep = rest.indexOf("|");
    const pRaw = sep === -1 ? rest : rest.slice(0, sep);
    const p = Number(pRaw);
    job.stage = "postprocess";
    if (Number.isFinite(p)) {
      job.percent = Math.min(
        99,
        Math.max(job.percent, Math.round(90 + p * 0.09)),
      );
    } else {
      job.percent = Math.max(job.percent, 96);
    }
  }
}

/**
 * @param {string} jobId
 * @param {string} videoUrl
 */
async function runYoutubeJob(jobId, videoUrl) {
  const job = jobs.get(jobId);
  if (!job) return;

  updateYtDlpBinaryOnce();

  job.status = "running";
  job.stage = "starting";
  job.percent = 0;

  const relativeOut = path.join("temp", `${jobId}.mp3`);
  const outputPath = path.resolve(relativeOut);
  job.outputPath = outputPath;

  let stderrAll = "";

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
        const j = jobs.get(jobId);
        if (!j) return;
        applyProgressLine(j, line);
      },
      (pct) => {
        const j = jobs.get(jobId);
        if (!j) return;
        j.percent = Math.min(95, Math.max(j.percent, Math.round(pct)));
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
      const msg =
        stderrAll.trim().slice(-2000) ||
        `yt-dlp exited with code ${result.exitCode ?? "unknown"}`;
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
    scheduleJobCleanup(jobId);
  } catch (error) {
    console.error(error);
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Conversion failed";
    job.percent = 0;
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

function registerRoutes(router) {
  router.get("/extract-audio", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("Missing url parameter");

  const outputPath = `./temp/audio-${Date.now()}.mp3`;

  try {
    updateYtDlpBinaryOnce();
    await ytdlp(videoUrl, {
      noPlaylist: true,
      format: "bestaudio/best",
      concurrentFragments: 4,
      extractAudio: true,
      audioFormat: "mp3",
      output: outputPath,
      ...ytdlpDefaultFlags,
      ...(cookiesFromBrowser ? { cookiesFromBrowser } : {}),
    });

    res.sendFile(path.resolve(outputPath), () => {
      fs.unlink(outputPath, () => {}); // 전송 후 삭제
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to extract audio");
  }
  });

  router.post("/youtube/jobs", (req, res) => {
  try {
    const url = req.body?.url;
    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ error: "Missing url" });
    }

    const jobId = randomUUID();
    jobs.set(jobId, {
      status: "queued",
      percent: 0,
      stage: "",
      error: null,
      outputPath: null,
      cleanupAt: null,
    });

    void runYoutubeJob(jobId, url.trim());

    return res.json({ jobId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create job" });
  }
  });

  router.get("/youtube/jobs/:jobId", (req, res) => {
  try {
    const job = jobs.get(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({
      status: job.status,
      percent: job.percent,
      stage: job.stage,
      ...(job.status === "error" && job.error ? { error: job.error } : {}),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to read job" });
  }
  });

  router.get("/youtube/jobs/:jobId/audio", (req, res) => {
  try {
    const job = jobs.get(req.params.jobId);
    if (!job) {
      return res.status(404).send("Not found");
    }
    if (job.status !== "done" || !job.outputPath) {
      return res.status(409).send("Not ready");
    }

    const filePath = job.outputPath;
    // NOTE: Do not refresh TTL on audio access (e.g. seek / range).

    const range = req.headers.range;
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Cache-Control",
      "private, max-age=0, no-cache, no-store, must-revalidate",
    );

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        console.error(err);
        return res.status(404).send("Not found");
      }

      const size = stat.size;

      if (!range) {
        res.setHeader("Content-Length", size);
        const stream = fs.createReadStream(filePath);
        stream.on("error", (e) => {
          console.error(e);
          try {
            res.end();
          } catch {
            // ignore
          }
        });
        return stream.pipe(res);
      }

      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) {
        res.setHeader("Content-Range", `bytes */${size}`);
        return res.status(416).send("Invalid Range");
      }

      let start = m[1] ? Number(m[1]) : 0;
      let end = m[2] ? Number(m[2]) : size - 1;

      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
        res.setHeader("Content-Range", `bytes */${size}`);
        return res.status(416).send("Invalid Range");
      }

      if (start >= size) {
        res.setHeader("Content-Range", `bytes */${size}`);
        return res.status(416).send("Range Not Satisfiable");
      }

      end = Math.min(end, size - 1);

      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
      res.setHeader("Content-Length", chunkSize);

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on("error", (e) => {
        console.error(e);
        try {
          res.end();
        } catch {
          // ignore
        }
      });
      return stream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Failed to send audio");
  }
  });
}

const api = express.Router();
registerRoutes(api);
app.use("/api", api);
registerRoutes(app);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
