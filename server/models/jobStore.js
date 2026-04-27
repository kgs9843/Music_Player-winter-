/**
 * @typedef {{ status: string, percent: number, stage: string, error: string | null, outputPath: string | null, cleanupAt: number | null }} Job
 */

/** @type {Map<string, Job>} */
const jobs = new Map();

export function getJobs() {
  return jobs;
}

export function getJob(jobId) {
  return jobs.get(jobId) ?? null;
}

export function setJob(jobId, job) {
  jobs.set(jobId, job);
}

export function deleteJob(jobId) {
  jobs.delete(jobId);
}

