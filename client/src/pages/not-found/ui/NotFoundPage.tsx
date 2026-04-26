import * as React from 'react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="panel">
        <div className="title">SnowGlow</div>
        <div className="subtitle">Page not found</div>
        <Link className="btn" to="/">
          Go Home
        </Link>
      </div>
    </div>
  )
}
