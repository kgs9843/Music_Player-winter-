/**
 * @param {(line: string) => void} onLine
 * @param {(pct: number) => void} onPercent
 */
export function createProgressSink(onLine, onPercent) {
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
 * @param {import("../models/jobStore.js").Job} job
 * @param {string} line — `DL|percent|status` 또는 `PP|percent|status` (status에 `|` 포함 가능)
 */
export function applyProgressLine(job, line) {
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
      job.percent = Math.min(99, Math.max(job.percent, Math.round(90 + p * 0.09)));
    } else {
      job.percent = Math.max(job.percent, 96);
    }
  }
}

