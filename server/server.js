import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors.js";
import { buildYoutubeRouter } from "./routes/youtubeRoutes.js";

dotenv.config();

const app = express();

app.use(cors(corsOptions()));
app.use(express.json({ limit: "32kb" }));

const youtubeRouter = buildYoutubeRouter();
app.use("/api", youtubeRouter);
app.use("/", youtubeRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
