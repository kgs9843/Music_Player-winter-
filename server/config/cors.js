const defaultAllowedOrigins = ["http://localhost:5173"];

export function getAllowedOrigins() {
  const raw =
    typeof process.env.ALLOWED_ORIGINS === "string"
      ? process.env.ALLOWED_ORIGINS.trim()
      : "";
  if (!raw) return defaultAllowedOrigins;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsOptions() {
  const allowedOrigins = getAllowedOrigins();
  return {
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) may omit Origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS: origin not allowed"));
    },
  };
}

