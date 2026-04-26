import * as React from 'react'
import { useNavigate } from 'react-router-dom'

type VisualizerNavState =
  | { kind: 'preset'; index: number }
  | { kind: 'youtube'; url: string }
  | { kind: 'file'; file: File }

export function HomePage() {
  const navigate = useNavigate()
  const [youtubeUrl, setYoutubeUrl] = React.useState('')
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  const presets = [
    'Snowflakes Falling Down by Simon Panrucker',
    'This Christmas by Dott',
    'No room at the inn by TRG Banks',
    'Jingle Bell Swing by Mark Smeby',
  ]

  const go = (state: VisualizerNavState) => {
    navigate('/visualizer', { state })
  }

  const parseYoutubeUrl = (raw: string) => {
    try {
      const u = new URL(raw)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
      const host = u.hostname.toLowerCase()
      const isYoutube =
        host === 'youtube.com' ||
        host.endsWith('.youtube.com') ||
        host === 'youtu.be'
      if (!isYoutube) return null
      return u.toString()
    } catch {
      return null
    }
  }

  return (
    <div id="overlay">
      <div className="panel">
        <div className="title">SnowGlow</div>
        <div className="subtitle">Upload a song or paste a YouTube link</div>

        <div className="stack">
          {presets.map((label, index) => (
            <button
              key={label}
              className="btn"
              type="button"
              onClick={() => go({ kind: 'preset', index })}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="separator">OR</div>

        <input
          ref={fileRef}
          type="file"
          id="upload"
          hidden
          accept=".mp3,audio/mpeg"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return

            const isMp3 =
              file.type === 'audio/mpeg' ||
              file.name.toLowerCase().endsWith('.mp3')
            if (!isMp3) {
              alert('MP3 파일만 업로드할 수 있어요.')
              e.target.value = ''
              return
            }

            go({ kind: 'file', file })
          }}
        />
        <label htmlFor="upload">Upload mp3</label>

        <div className="separator">OR</div>

        <div className="input_conatiner">
          <input
            type="text"
            id="youtubeUrl"
            placeholder="Paste YouTube URL here"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <button
            id="convertBtn"
            type="button"
            onClick={() => {
              const url = youtubeUrl.trim()
              if (!url) {
                alert('YouTube URL을 입력해줘.')
                return
              }
              const parsed = parseYoutubeUrl(url)
              if (!parsed) {
                alert('유효한 YouTube URL이 아니에요. 링크를 확인해 주세요.')
                return
              }
              go({ kind: 'youtube', url: parsed })
            }}
          >
            Convert &amp; Play
          </button>
        </div>

        <div className="credits" aria-label="Credits">
          <span className="credits-label">Reference</span>
          <a
            className="credits-link"
            href="https://codepen.io/dilums/pen/MWjEqaa"
            target="_blank"
            rel="noreferrer"
          >
            CodePen: dilums — MWjEqaa
          </a>
        </div>
      </div>
    </div>
  )
}
