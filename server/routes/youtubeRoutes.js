import express from "express";
import {
  createYoutubeJob,
  extractAudio,
  getYoutubeJob,
  streamYoutubeJobAudio,
} from "../controllers/youtubeController.js";

export function buildYoutubeRouter() {
  const router = express.Router();

  // Legacy
  router.get("/extract-audio", extractAudio);

  // Job-based
  router.post("/youtube/jobs", createYoutubeJob);
  router.get("/youtube/jobs/:jobId", getYoutubeJob);
  router.get("/youtube/jobs/:jobId/audio", streamYoutubeJobAudio);

  return router;
}

