const ALLOWED_YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

export function isAllowedYoutubeUrl(raw) {
  if (typeof raw !== "string") return false;
  const s = raw.trim();
  if (!s) return false;
  if (s.length > 2000) return false;

  let u;
  try {
    u = new URL(s);
  } catch {
    return false;
  }

  if (u.protocol !== "https:" && u.protocol !== "http:") return false;

  const host = u.hostname.toLowerCase();
  if (!ALLOWED_YT_HOSTS.has(host)) return false;

  return true;
}

