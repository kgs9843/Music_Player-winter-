// server/server.js
import express from "express";
import ytdlp from "yt-dlp-exec";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // Vite 기본 포트 허용

app.get("/extract-audio", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("Missing url parameter");

  const outputPath = `./temp/audio-${Date.now()}.mp3`;

  try {
    await ytdlp(videoUrl, {
      extractAudio: true,
      audioFormat: "mp3",
      output: outputPath,
    });

    res.sendFile(path.resolve(outputPath), () => {
      fs.unlink(outputPath, () => {}); // 전송 후 삭제
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to extract audio");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
