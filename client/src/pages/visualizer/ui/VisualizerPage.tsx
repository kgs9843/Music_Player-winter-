import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  createWinterVisualizer,
  type WinterVisualizerHandle,
} from '@/widgets/winter-visualizer'
import fullScreenIcon from '@/assets/fullScreen.svg'
import exitFullScreenIcon from '@/assets/exitFullScreen.svg'
import playIcon from '@/assets/play.svg'
import stopIcon from '@/assets/stop.svg'

type NavState =
  | { kind: 'preset'; index: number }
  | { kind: 'youtube'; url: string }
  | { kind: 'file'; file: File }
  | undefined

function formatTimecode(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor(seconds / 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VisualizerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as NavState

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const visualizerRef = React.useRef<WinterVisualizerHandle | null>(null)
  const scrubbingRef = React.useRef(false)
  const [loading, setLoading] = React.useState(true)
  const [loadingText, setLoadingText] = React.useState('Preparing visualizer…')
  const [error, setError] = React.useState<string | null>(null)
  const [durationSec, setDurationSec] = React.useState(0)
  const [currentSec, setCurrentSec] = React.useState(0)
  const [paused, setPaused] = React.useState(true)
  const [topbarPostLoadHold, setTopbarPostLoadHold] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  React.useEffect(() => {
    // React.StrictMode (dev) runs effects twice (mount -> cleanup -> mount).
    // Guard state updates so a disposed run cannot flash error UI.
    let alive = true

    if (!state) {
      setLoading(false)
      setError('시작할 소스가 없어요. 메인 화면에서 선택해주세요.')
      return
    }

    if (!containerRef.current) return

    const visualizer = createWinterVisualizer({
      mount: containerRef.current,
      onLoading: (text) => {
        if (!alive) return
        setError(null)
        setLoading(true)
        setLoadingText(text)
      },
      onReady: () => {
        if (!alive) return
        setLoading(false)
      },
      onError: (msg) => {
        if (!alive) return
        setError(msg)
        setLoading(false)
      },
    })
    visualizerRef.current = visualizer
    ;(async () => {
      try {
        if (state.kind === 'preset') {
          await visualizer.playFromPreset(state.index)
        } else if (state.kind === 'youtube') {
          await visualizer.playFromYoutubeUrl(state.url)
        } else if (state.kind === 'file') {
          await visualizer.playFromFile(state.file)
        }
      } catch (e) {
        if (!alive) return
        console.error(e)
        setError('재생을 시작하지 못했어요.')
        setLoading(false)
      }
    })()

    const onPageHide = () => visualizer.dispose()
    const onBeforeUnload = () => visualizer.dispose()

    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      alive = false
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('beforeunload', onBeforeUnload)
      visualizer.dispose()
      visualizerRef.current = null
    }
  }, [state])

  React.useEffect(() => {
    if (loading || error) return

    let raf = 0

    const tick = () => {
      try {
        const v = visualizerRef.current
        if (v) {
          const d = v.getDurationSec()
          if (d > 0) {
            setDurationSec((prev) => (Math.abs(prev - d) > 0.05 ? d : prev))
          }

          if (!scrubbingRef.current && d > 0) {
            setCurrentSec(v.getCurrentTimeSec())
          }

          setPaused(v.isPaused())
        }
      } catch (e) {
        console.error(e)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loading, error])

  React.useEffect(() => {
    if (loading) {
      setTopbarPostLoadHold(false)
      return
    }

    setTopbarPostLoadHold(true)
    const t = window.setTimeout(() => setTopbarPostLoadHold(false), 3000)
    return () => window.clearTimeout(t)
  }, [loading])

  React.useEffect(() => {
    const sync = () => {
      try {
        setIsFullscreen(!!document.fullscreenElement)
      } catch {
        // ignore
      }
    }

    sync()
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        // Fullscreen the entire app viewport
        await document.documentElement.requestFullscreen()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const durationForUi = durationSec > 0 ? durationSec : 1
  const scrubMax = Math.max(0.001, durationForUi - 1e-6)

  return (
    <div className="visualizer-page">
      <div className="topbar-reveal-zone" aria-hidden="true" />
      <div
        className={`visualizer-topbar${
          loading
            ? ' visualizer-topbar--loading'
            : topbarPostLoadHold
              ? ' visualizer-topbar--postload'
              : ''
        }`}
      >
        <div className="topbar-left">
          <button className="ghost" type="button" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
        {!loading ? (
          <div className="topbar-center">
            <div className="topbar-playbar">
              <button
                className="ghost topbar-play"
                type="button"
                aria-label={paused ? '재생' : '일시정지'}
                disabled={!!error}
                onClick={() => {
                  try {
                    visualizerRef.current?.togglePlay()
                  } catch (e) {
                    console.error(e)
                  }
                }}
              >
                <img
                  className="icon-img"
                  src={paused ? playIcon : stopIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>
              <span className="topbar-time" aria-hidden="true">
                {formatTimecode(currentSec)}
              </span>
              <input
                className="topbar-seek"
                type="range"
                min={0}
                max={scrubMax}
                step={0.1}
                value={Math.min(scrubMax, Math.max(0, currentSec))}
                disabled={!!error || durationSec <= 0}
                aria-label="재생 위치"
                onPointerDown={() => {
                  scrubbingRef.current = true
                }}
                onPointerUp={() => {
                  scrubbingRef.current = false
                }}
                onPointerCancel={() => {
                  scrubbingRef.current = false
                }}
                onChange={(e) => {
                  try {
                    const t = Number(e.target.value)
                    setCurrentSec(t)
                    visualizerRef.current?.seekSec(t)
                  } catch (err) {
                    console.error(err)
                  }
                }}
              />
              <span className="topbar-time" aria-hidden="true">
                {formatTimecode(durationSec)}
              </span>
            </div>
          </div>
        ) : null}
        {!loading ? (
          <div className="topbar-right">
            <button
              className="ghost icon-btn"
              type="button"
              aria-label={isFullscreen ? '전체화면 종료' : '전체화면'}
              onClick={() => {
                try {
                  void toggleFullscreen()
                } catch (e) {
                  console.error(e)
                }
              }}
            >
              <img
                className="icon-img"
                src={isFullscreen ? exitFullScreenIcon : fullScreenIcon}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>

      <div ref={containerRef} className="visualizer-canvas" />

      {loading ? (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-content">
            <div className="spinner" aria-hidden="true" />
            <div className="loading-title">{loadingText}</div>
            <div className="loading-subtitle">
              Audio decoding &amp; shader warm-up
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="error-overlay" role="alert">
          <div className="error-title">Oops</div>
          <div className="error-message">{error}</div>
          <Link className="error-link" to="/">
            Go to Home
          </Link>
        </div>
      ) : null}
    </div>
  )
}
