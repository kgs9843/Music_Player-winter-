export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
}

export function getApiBaseUrl() {
  // Prefer relative base in production so we can serve:
  // - frontend from https://example.com/
  // - backend via CloudFront path routing https://example.com/api/*
  const base =
    env.apiBaseUrl?.trim() ||
    (import.meta.env.DEV ? 'http://localhost:3000' : '/api')

  return base.replace(/\/$/, '')
}
