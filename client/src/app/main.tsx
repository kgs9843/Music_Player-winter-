import '@/index.css'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const el = document.getElementById('root')
if (!el) {
  throw new Error('#root not found')
}

createRoot(el).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
