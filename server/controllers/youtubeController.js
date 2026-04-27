import fs from "fs";
import path from "path";
import ytdlp from "yt-dlp-exec";
import { randomUUID } from "crypto";

import { getJob, setJob } from "../models/jobStore.js";
import { runYoutubeJob } from "../services/ytdlpService.js";
import { isAllowedYoutubeUrl } from "../utils/validateYoutubeUrl.js";

const cookiesFromBrowser =
  typeof process.env.YTDLP_COOKIES_FROM_BROWSER === "string" &&
  process.env.YTDLP_COOKIES_FROM_BROWSER.trim()
    ? process.env.YTDLP_COOKIES_FROM_BROWSER.trim()
    : null;

const ytdlpDefaultFlags = {
  impersonate: "chrome:windows-10",
  extractorArgs: "youtube:player_client=android",
};

export async function extractAudio(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("Missing url parameter");
  if (!isAllowedYoutubeUrl(String(videoUrl))) {
    return res.status(400).send("Only YouTube URLs are allowed");
  }

  const outputPath = `./temp/audio-${Date.now()}.mp3`;

  try {
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
}

export function createYoutubeJob(req, res) {
  try {
    const url = req.body?.url;
    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ error: "Missing url" });
    }
    if (!isAllowedYoutubeUrl(url)) {
      return res.status(400).json({ error: "Only YouTube URLs are allowed" });
    }

    const jobId = randomUUID();
    setJob(jobId, {
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
}

export function getYoutubeJob(req, res) {
  try {
    const job = getJob(req.params.jobId);
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
}

export function streamYoutubeJobAudio(req, res) {
  try {
    const job = getJob(req.params.jobId);
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
}

