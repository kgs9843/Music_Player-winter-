export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '',
}

export function getApiBaseUrl() {
  const base =
    env.apiBaseUrl?.trim() ||
    (import.meta.env.DEV ? 'http://localhost:3000' : '')

  return base.replace(/\/$/, '')
}
