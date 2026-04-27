import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve("logs");

function safeJsonStringify(x) {
  try {
    return JSON.stringify(x);
  } catch {
    return JSON.stringify({ level: "error", msg: "failed_to_stringify_log" });
  }
}

async function ensureDir(dir) {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function classifyYtdlpFailure(stderrText) {
  const s = String(stderrText || "");
  const lower = s.toLowerCase();

  if (/http error 429|too many requests/.test(lower)) return "yt_429";
  if (/http error 403|forbidden/.test(lower)) return "yt_403";
  if (/sign in|login required|account.*required/.test(lower)) return "yt_signin";
  if (/confirm your age|age.*confirm|age[- ]restricted/.test(lower))
    return "yt_age_gate";
  if (/video unavailable|this video is unavailable|not available/.test(lower))
    return "yt_unavailable";
  if (/proxy|timed out|timeout|econnreset|enotfound|eai_again/.test(lower))
    return "network";
  if (/ffmpeg|postprocess|post-process/.test(lower)) return "ffmpeg";

  return "unknown";
}

export function tailText(s, maxChars) {
  const t = String(s || "");
  if (t.length <= maxChars) return t;
  return t.slice(-maxChars);
}

export async function appendJobLog(jobId, event) {
  const line = safeJsonStringify(event) + "\n";
  try {
    await ensureDir(LOG_DIR);
    const jobLogPath = path.join(LOG_DIR, `${jobId}.jsonl`);
    await fs.promises.appendFile(jobLogPath, line, "utf8");
  } catch {
    // ignore
  }
  // Always mirror to stdout for local debugging / docker logs
  try {
    console.log(line.trimEnd());
  } catch {
    // ignore
  }
}

export async function writeJobStderr(jobId, stderrAll) {
  if (!stderrAll || !String(stderrAll).trim()) return;
  try {
    await ensureDir(LOG_DIR);
    const errPath = path.join(LOG_DIR, `${jobId}.stderr.txt`);
    await fs.promises.writeFile(errPath, stderrAll, "utf8");
  } catch {
    // ignore
  }
}

