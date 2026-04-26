import * as React from 'react'

export default function RouteFallback() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="spinner" aria-hidden="true" />
        <div className="loading-title">Loading…</div>
        <div className="loading-subtitle">Preparing route</div>
      </div>
    </div>
  )
}
