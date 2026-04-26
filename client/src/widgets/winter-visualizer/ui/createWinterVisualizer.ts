import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { getApiBaseUrl } from '@/shared/config/env'
import type { WinterAppearanceSettings } from '../model/appearance'
import {
  getDefaultWinterAppearance,
  snowGlowEffectConfig,
  winterTextureUrls,
} from '../model/config'

const { PI, sin, cos } = Math
const TAU = 2 * PI

const map = (
  value: number,
  sMin: number,
  sMax: number,
  dMin: number,
  dMax: number,
) => dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin)

const range = (n: number, m = 0) =>
  Array(n)
    .fill(m)
    .map((i, j) => i + j)

const rand = (max: number, min = 0) => min + Math.random() * (max - min)
const randInt = (max: number, min = 0) =>
  Math.floor(min + Math.random() * (max - min))
const randChoice = <T>(arr: T[]) => arr[randInt(arr.length)]
const polar = (ang: number, r = 1) => [r * cos(ang), r * sin(ang)] as const

const fftSize = 2048

type WinterVisualizerOptions = {
  mount?: HTMLElement
  onLoading?: (text: string) => void
  onReady?: () => void
  onError?: (message: string) => void
}

export type WinterVisualizerHandle = {
  playFromPreset: (i: number) => Promise<void>
  playFromYoutubeUrl: (url: string) => Promise<void>
  playFromFile: (file: File) => Promise<void>
  getDurationSec: () => number
  getCurrentTimeSec: () => number
  seekSec: (t: number) => void
  togglePlay: () => void
  isPaused: () => boolean
  applyAppearance: (patch: Partial<WinterAppearanceSettings>) => void
  getAppearance: () => WinterAppearanceSettings
  dispose: () => void
}

type AudioClock = THREE.Audio & {
  _progress: number
  _startedAt: number
}

function bufferPlaybackSeconds(sound: THREE.Audio): number {
  const a = sound as AudioClock
  const bufDur = sound.buffer?.duration
  if (!bufDur || bufDur <= 0) return 0

  if (!sound.isPlaying) {
    return Math.min(bufDur, Math.max(0, a.offset + a._progress))
  }

  const elapsed =
    (sound.context.currentTime - a._startedAt) * sound.playbackRate
  let pos = a.offset + a._progress + Math.max(elapsed, 0)
  if (sound.loop) {
    const span = sound.duration ?? bufDur
    if (span > 0) pos = pos % span
  }
  return Math.min(bufDur, Math.max(0, pos))
}

function seekBufferSeconds(sound: THREE.Audio, t: number) {
  const bufDur = sound.buffer?.duration
  if (!bufDur || bufDur <= 0) return

  const target = Math.min(bufDur, Math.max(0, t))
  const wasPlaying = sound.isPlaying

  try {
    sound.stop()
  } catch {
    // ignore
  }

  sound.offset = target

  if (wasPlaying) {
    try {
      sound.play()
    } catch {
      // ignore
    }
  }
}

export function createWinterVisualizer(
  options: WinterVisualizerOptions = {},
): WinterVisualizerHandle {
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let renderer: THREE.WebGLRenderer | undefined
  let analyser: THREE.AudioAnalyser | undefined
  let composer: EffectComposer | undefined
  let step = 0
  let rafId: number | null = null
  let disposed = false
  let youtubeAbort: AbortController | null = null
  let bloomPass: UnrealBloomPass | undefined

  const appearance: WinterAppearanceSettings = getDefaultWinterAppearance()
  const snowAppearanceUniforms = {
    uSnowSizeScale: { value: appearance.snow.sizeScale },
    uSnowColor: { value: new THREE.Color(appearance.snow.colorHex) },
  }
  const sparkleTintUniforms = {
    uSparkleTint: {
      value: new THREE.Color(appearance.shader.tintHex),
    },
  }
  const treeColorUniforms = {
    uTreeHueStart: { value: appearance.shader.tree.hueStart },
    uTreeHueEnd: { value: appearance.shader.tree.hueEnd },
    uTreeSaturation: { value: appearance.shader.tree.saturation },
    uTreeLightness: { value: appearance.shader.tree.lightness },
  }
  const planePaletteUniforms = {
    uPlaneColor0: { value: new THREE.Color(appearance.shader.planeColors[0]) },
    uPlaneColor1: { value: new THREE.Color(appearance.shader.planeColors[1]) },
    uPlaneColor2: { value: new THREE.Color(appearance.shader.planeColors[2]) },
  }

  /** `ShaderMaterial`이 유니폼 객체를 복제하는 경우 대비 — 라이브 머티리얼에 직접 반영 */
  let planeSparkleMaterial: THREE.ShaderMaterial | undefined
  const snowMaterialRefs: THREE.ShaderMaterial[] = []

  const POLL_MS = 550

  /** 스프라이트 PNG(로컬 assets) — init마다 로드, dispose 시 해제 */
  let loadedTextures: THREE.Texture[] = []

  let mediaEl: HTMLAudioElement | null = null
  let mediaElObjectUrl: string | null = null
  /** `ended` 이벤트 — 스트리밍에서 currentTime이 duration보다 짧게 남어도 시크바를 끝에 맞출 때 사용 */
  let mediaReportedFinished = false

  const onKeyDown = (e: KeyboardEvent) => {
    if (!camera) return
    if (e.key !== 'p') return
    const { x, y, z } = camera.position
    console.log(`camera.position.set(${x},${y},${z})`)
    const { x: a, y: b, z: c } = camera.rotation
    console.log(`camera.rotation.set(${a},${b},${c})`)
  }

  const onResize = () => {
    if (!camera || !renderer || !composer) return
    const width = window.innerWidth
    const height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    composer.setSize(width, height)
  }

  const listener = new THREE.AudioListener()
  const audio = new THREE.Audio(listener)

  const uniforms: Record<string, any> = {
    time: { type: 'f', value: 0.0 },
    step: { type: 'f', value: 0.0 },
  }

  function disposeLoadedTextures() {
    for (const t of loadedTextures) {
      t.dispose()
    }
    loadedTextures = []
  }

  function loadWinterSpriteTextures() {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    const pending: THREE.Texture[] = []
    const loadOne = (url: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            pending.push(tex)
            resolve(tex)
          },
          undefined,
          reject,
        )
      })

    return (async () => {
      try {
        const sparkle = await loadOne(winterTextureUrls.sparkle)
        const flakes = await Promise.all(
          [...winterTextureUrls.snowflakes].map((u) => loadOne(u)),
        )
        return { sparkleTexture: sparkle, snowTextures: flakes }
      } catch (e) {
        for (const t of pending) {
          t.dispose()
        }
        throw e
      }
    })()
  }

  async function init() {
    if (disposed) return

    disposeLoadedTextures()

    const { sparkleTexture, snowTextures } = await loadWinterSpriteTextures()
    loadedTextures = [sparkleTexture, ...snowTextures]

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    const host = options.mount ?? document.body
    host.appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000,
    )
    camera.position.set(
      -0.09397456774197047,
      -2.5597086635726947,
      24.420789670889008,
    )
    camera.rotation.set(
      0.10443543723052419,
      -0.003827152981119352,
      0.0004011488708739715,
    )
    camera.add(listener)

    analyser ??= new THREE.AudioAnalyser(audio, fftSize)

    const format = THREE.RedFormat as THREE.PixelFormat

    uniforms.tAudioData = {
      value: new THREE.DataTexture(analyser.data, fftSize / 2, 1, format),
    }

    snowMaterialRefs.length = 0
    planeSparkleMaterial = undefined

    planeSparkleMaterial = addPlane(
      scene,
      uniforms,
      snowGlowEffectConfig.scene.planePoints,
      sparkleTexture,
      sparkleTintUniforms,
      planePaletteUniforms,
    )
    addSnow(
      scene,
      uniforms,
      snowTextures,
      snowAppearanceUniforms,
      snowMaterialRefs,
    )

    range(snowGlowEffectConfig.scene.trees.rows).forEach((i) => {
      addTree(
        scene!,
        uniforms,
        snowGlowEffectConfig.scene.trees.pointsPerTree,
        [20, 0, -20 * i],
        sparkleTexture,
        sparkleTintUniforms,
        treeColorUniforms,
      )
      addTree(
        scene!,
        uniforms,
        snowGlowEffectConfig.scene.trees.pointsPerTree,
        [-20, 0, -20 * i],
        sparkleTexture,
        sparkleTintUniforms,
        treeColorUniforms,
      )
    })

    const renderScene = new RenderPass(scene, camera)
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    )
    bloomPass.threshold = appearance.bloom.threshold
    bloomPass.strength = appearance.bloom.strength
    bloomPass.radius = appearance.bloom.radius

    composer = new EffectComposer(renderer)
    composer.addPass(renderScene)
    composer.addPass(bloomPass)

    addListeners()
    animate()
    options.onReady?.()
  }

  function animate(time = 0) {
    if (disposed) return
    if (!analyser || !composer) return

    analyser.getFrequencyData()
    uniforms.tAudioData.value.needsUpdate = true
    step = (step + 1) % 1000
    uniforms.time.value = time
    uniforms.step.value = step
    composer.render()
    rafId = requestAnimationFrame(animate)
  }

  function addListeners() {
    if (!camera || !renderer || !composer) return

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize, false)
  }

  async function playFromPreset(i: number) {
    options.onLoading?.('Loading preset…')
    const files = [
      'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Simon_Panrucker/Happy_Christmas_You_Guys/Simon_Panrucker_-_01_-_Snowflakes_Falling_Down.mp3',
      'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dott/This_Christmas/Dott_-_01_-_This_Christmas.mp3',
      'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/TRG_Banks/TRG_Banks_Christmas_Album/TRG_Banks_-_12_-_No_room_at_the_inn.mp3',
      'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Mark_Smeby/En_attendant_Nol/Mark_Smeby_-_07_-_Jingle_Bell_Swing.mp3',
    ]
    const file = files[i]

    await loadAndPlayUrl(file)
  }

  async function playFromFile(file: File) {
    // NOTE: Avoid decodeAudioData for user files when possible.
    // Some mp3s fail to decode or are very large; streaming via <audio>
    // is more robust and enables seeking.
    options.onLoading?.('오디오 준비 중…')
    const objectUrl = URL.createObjectURL(file)
    await playFromMediaElementUrl(objectUrl, { isObjectUrl: true })
  }

  async function playFromYoutubeUrl(url: string) {
    youtubeAbort?.abort()
    youtubeAbort = new AbortController()
    const signal = youtubeAbort.signal

    options.onLoading?.('YouTube 변환 중… 0%')

    try {
      const apiBase = getApiBaseUrl()
      if (!apiBase) {
        throw new Error('API base URL is not configured')
      }

      const createRes = await fetch(`${apiBase}/youtube/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal,
      })

      if (!createRes.ok) {
        throw new Error('Failed to start YouTube conversion job')
      }

      const { jobId } = (await createRes.json()) as { jobId?: string }
      if (!jobId) {
        throw new Error('Missing jobId from server')
      }

      type JobStatus = {
        status: string
        percent?: number
        error?: string
      }

      while (true) {
        if (signal.aborted) return

        const statusRes = await fetch(`${apiBase}/youtube/jobs/${jobId}`, {
          signal,
        })
        if (!statusRes.ok) {
          throw new Error('Failed to read conversion progress')
        }

        const job = (await statusRes.json()) as JobStatus

        if (job.status === 'error') {
          throw new Error(job.error || 'YouTube conversion failed')
        }

        if (job.status === 'done') {
          options.onLoading?.(
            `YouTube 변환 중… ${Math.min(100, Math.max(0, Math.round(job.percent ?? 100)))}%`,
          )
          break
        }

        const pct = Math.min(99, Math.max(0, Math.round(job.percent ?? 0)))
        options.onLoading?.(`YouTube 변환 중… ${pct}%`)

        await new Promise<void>((resolve, reject) => {
          const onAbort = () => {
            window.clearTimeout(t)
            reject(new DOMException('Aborted', 'AbortError'))
          }
          const t = window.setTimeout(() => {
            signal.removeEventListener('abort', onAbort)
            resolve()
          }, POLL_MS)
          signal.addEventListener('abort', onAbort, { once: true })
        })
      }

      // NOTE: Do not download + decode the whole mp3 with decodeAudioData here.
      // Long mp3s can fail to decode or OOM. Instead, stream via <audio> element
      // and connect it to WebAudio for analysis.
      await playFromMediaElementUrl(`${apiBase}/youtube/jobs/${jobId}/audio`)
    } catch (err) {
      if (signal.aborted) return
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.error(err)
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Unknown error'

      const pretty =
        /not a valid url/i.test(msg) || /is not a valid url/i.test(msg)
          ? '유효한 URL이 아니에요. YouTube 링크를 확인해 주세요.'
          : /CORS/i.test(msg)
            ? '서버 접근이 차단됐어요(CORS). 배포 도메인/서버 설정을 확인해 주세요.'
            : /Failed to start YouTube conversion job/i.test(msg)
              ? 'YouTube 변환 작업을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.'
              : /YouTube conversion failed/i.test(msg)
                ? 'YouTube 변환에 실패했어요. 다른 링크로 시도해 주세요.'
                : msg

      options.onError?.(pretty)
    }
  }

  async function playFromMediaElementUrl(
    url: string,
    opts: { isObjectUrl?: boolean } = {},
  ) {
    options.onLoading?.('오디오 스트리밍 준비 중…')

    if (mediaEl) {
      try {
        mediaEl.pause()
      } catch {
        // ignore
      }
      mediaEl.src = ''
      mediaEl.load()
      mediaEl = null
      mediaReportedFinished = false
    }
    if (mediaElObjectUrl && mediaElObjectUrl !== url) {
      try {
        URL.revokeObjectURL(mediaElObjectUrl)
      } catch {
        // ignore
      }
      mediaElObjectUrl = null
    }

    const el = document.createElement('audio')
    el.crossOrigin = 'anonymous'
    el.preload = 'auto'
    el.src = url
    mediaEl = el
    mediaElObjectUrl = opts.isObjectUrl ? url : null
    mediaReportedFinished = false

    const clearFinished = () => {
      mediaReportedFinished = false
    }
    el.addEventListener('play', clearFinished)
    el.addEventListener('seeking', clearFinished)
    el.addEventListener('ended', () => {
      mediaReportedFinished = true
    })

    try {
      void listener.context.resume()
    } catch {
      // ignore
    }

    audio.setMediaElementSource(el)
    analyser = new THREE.AudioAnalyser(audio, fftSize)

    options.onLoading?.('오디오 스트리밍 중…')
    await el.play()

    try {
      await init()
    } catch (e) {
      console.error(e)
      options.onError?.(
        '비주얼 텍스처를 불러오지 못했어요. 네트워크를 확인해 주세요.',
      )
      throw e
    }
  }

  function getDurationSec(): number {
    if (mediaEl) {
      const d = mediaEl.duration
      return Number.isFinite(d) && d > 0 ? d : 0
    }
    const d = audio.buffer?.duration
    return Number.isFinite(d) && d && d > 0 ? d : 0
  }

  function getCurrentTimeSec(): number {
    try {
      if (mediaEl) {
        const d = mediaEl.duration
        const t = mediaEl.currentTime
        if (Number.isFinite(d) && d > 0) {
          // 종료 후 currentTime이 duration보다 몇 초 짧게 남는 경우(메타데이터 길이 vs 실제 스트림) 대비
          if (mediaReportedFinished || mediaEl.ended) {
            return d
          }
          const gap = d - t
          const nearEndWhilePaused =
            mediaEl.paused &&
            !mediaEl.seeking &&
            Number.isFinite(t) &&
            t >= 0 &&
            t >= d * 0.985 &&
            gap > 0.04 &&
            gap <= 8
          if (nearEndWhilePaused) {
            return d
          }
        }
        return Number.isFinite(t) && t >= 0 ? t : 0
      }
      if (audio.sourceType === 'buffer' && audio.buffer) {
        return bufferPlaybackSeconds(audio)
      }
    } catch {
      // ignore
    }
    return 0
  }

  function seekSec(t: number) {
    try {
      if (mediaEl) {
        mediaReportedFinished = false
        mediaEl.currentTime = Math.max(0, t)
        return
      }
      if (audio.sourceType === 'buffer' && audio.buffer) {
        seekBufferSeconds(audio, t)
      }
    } catch {
      // ignore
    }
  }

  function togglePlay() {
    try {
      if (mediaEl) {
        if (mediaEl.paused) {
          void mediaEl.play()
        } else {
          mediaEl.pause()
        }
        return
      }
      if (audio.sourceType === 'buffer' && audio.buffer) {
        if (audio.isPlaying) {
          audio.pause()
        } else {
          audio.play()
        }
      }
    } catch {
      // ignore
    }
  }

  function isPaused(): boolean {
    try {
      if (mediaEl) return mediaEl.paused
      if (audio.sourceType === 'buffer' && audio.buffer) return !audio.isPlaying
    } catch {
      // ignore
    }
    return true
  }

  function decodeAndPlayArrayBuffer(arrayBuffer: ArrayBuffer) {
    return new Promise<void>((resolve, reject) => {
      if (disposed) {
        reject(new Error('disposed'))
        return
      }
      listener.context.decodeAudioData(
        arrayBuffer,
        (audioBuffer: AudioBuffer) => {
          if (disposed) return
          try {
            void listener.context.resume()
          } catch {
            // ignore
          }
          audio.setBuffer(audioBuffer)
          audio.play()
          analyser = new THREE.AudioAnalyser(audio, fftSize)
          void init()
            .then(() => resolve())
            .catch(reject)
        },
        () => reject(new Error('decodeAudioData failed')),
      )
    })
  }

  function loadAndPlayUrl(url: string) {
    return new Promise<void>((resolve, reject) => {
      if (disposed) {
        reject(new Error('disposed'))
        return
      }
      const loader = new THREE.AudioLoader()
      loader.load(
        url,
        (buffer: AudioBuffer) => {
          if (disposed) return
          try {
            void listener.context.resume()
          } catch {
            // ignore
          }
          audio.setBuffer(buffer)
          audio.play()
          analyser = new THREE.AudioAnalyser(audio, fftSize)
          void init()
            .then(() => resolve())
            .catch(reject)
        },
        undefined,
        () => reject(new Error('AudioLoader failed')),
      )
    })
  }

  function applyAppearance(patch: Partial<WinterAppearanceSettings>) {
    if (disposed) return
    if (patch.bloom) {
      const b = patch.bloom
      if (b.threshold !== undefined) appearance.bloom.threshold = b.threshold
      if (b.strength !== undefined) appearance.bloom.strength = b.strength
      if (b.radius !== undefined) appearance.bloom.radius = b.radius
      if (bloomPass) {
        bloomPass.threshold = appearance.bloom.threshold
        bloomPass.strength = appearance.bloom.strength
        bloomPass.radius = appearance.bloom.radius
      }
    }
    if (patch.shader) {
      const sh = patch.shader
      if (sh.tintHex !== undefined) {
        appearance.shader.tintHex = sh.tintHex
        sparkleTintUniforms.uSparkleTint.value.set(sh.tintHex)
      }
      if (sh.tree) {
        const t = sh.tree
        if (t.hueStart !== undefined) {
          appearance.shader.tree.hueStart = t.hueStart
          treeColorUniforms.uTreeHueStart.value = t.hueStart
        }
        if (t.hueEnd !== undefined) {
          appearance.shader.tree.hueEnd = t.hueEnd
          treeColorUniforms.uTreeHueEnd.value = t.hueEnd
        }
        if (t.saturation !== undefined) {
          appearance.shader.tree.saturation = t.saturation
          treeColorUniforms.uTreeSaturation.value = t.saturation
        }
        if (t.lightness !== undefined) {
          appearance.shader.tree.lightness = t.lightness
          treeColorUniforms.uTreeLightness.value = t.lightness
        }
      }
      if (sh.planeColors !== undefined) {
        appearance.shader.planeColors = [...sh.planeColors] as [
          string,
          string,
          string,
        ]
        const [c0, c1, c2] = sh.planeColors
        planePaletteUniforms.uPlaneColor0.value.set(c0)
        planePaletteUniforms.uPlaneColor1.value.set(c1)
        planePaletteUniforms.uPlaneColor2.value.set(c2)
        const pm = planeSparkleMaterial
        if (pm) {
          pm.uniforms.uPlaneColor0.value.set(c0)
          pm.uniforms.uPlaneColor1.value.set(c1)
          pm.uniforms.uPlaneColor2.value.set(c2)
        }
      }
    }
    if (patch.snow) {
      const s = patch.snow
      if (s.sizeScale !== undefined) {
        appearance.snow.sizeScale = s.sizeScale
        snowAppearanceUniforms.uSnowSizeScale.value = s.sizeScale
      }
      if (s.colorHex !== undefined) {
        appearance.snow.colorHex = s.colorHex
        snowAppearanceUniforms.uSnowColor.value.set(s.colorHex)
      }
      const sz = appearance.snow.sizeScale
      const hex = appearance.snow.colorHex
      for (const m of snowMaterialRefs) {
        m.uniforms.uSnowSizeScale.value = sz
        m.uniforms.uSnowColor.value.set(hex)
      }
    }
  }

  function getAppearance(): WinterAppearanceSettings {
    return {
      bloom: { ...appearance.bloom },
      shader: {
        tintHex: appearance.shader.tintHex,
        tree: { ...appearance.shader.tree },
        planeColors: [...appearance.shader.planeColors] as [
          string,
          string,
          string,
        ],
      },
      snow: {
        sizeScale: appearance.snow.sizeScale,
        colorHex: appearance.snow.colorHex,
      },
    }
  }

  function dispose() {
    disposed = true

    planeSparkleMaterial = undefined
    snowMaterialRefs.length = 0

    youtubeAbort?.abort()
    youtubeAbort = null
    bloomPass = undefined

    document.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onResize, false)

    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    try {
      audio.stop()
    } catch {
      // ignore
    }

    if (mediaEl) {
      try {
        mediaEl.pause()
      } catch {
        // ignore
      }
      mediaEl.src = ''
      mediaEl.load()
      mediaEl = null
    }
    mediaReportedFinished = false
    if (mediaElObjectUrl) {
      try {
        URL.revokeObjectURL(mediaElObjectUrl)
      } catch {
        // ignore
      }
      mediaElObjectUrl = null
    }

    try {
      audio.disconnect()
    } catch {
      // ignore
    }

    try {
      listener.remove()
    } catch {
      // ignore
    }

    // NOTE: Do not close() the AudioContext here. three.js audio is commonly
    // backed by a shared/singleton AudioContext; closing it can break audio
    // for the rest of the app until refresh. (See three.js AudioListener docs.)
    try {
      void listener.context.suspend()
    } catch {
      // ignore
    }

    if (composer) {
      composer.dispose()
      composer = undefined
    }

    disposeLoadedTextures()

    if (scene) {
      scene.traverse((obj) => {
        const anyObj = obj as any
        if (anyObj.geometry) anyObj.geometry.dispose?.()
        if (anyObj.material) {
          const mats = Array.isArray(anyObj.material)
            ? anyObj.material
            : [anyObj.material]
          for (const m of mats) {
            m.dispose?.()
          }
        }
      })
      scene.clear()
      scene = undefined
    }

    if (renderer) {
      renderer.domElement.remove()
      renderer.dispose()
      renderer = undefined
    }

    camera = undefined
    analyser = undefined
  }

  return {
    playFromPreset,
    playFromYoutubeUrl,
    playFromFile,
    getDurationSec,
    getCurrentTimeSec,
    seekSec,
    togglePlay,
    isPaused,
    applyAppearance,
    getAppearance,
    dispose,
  }
}

function addTree(
  scene: THREE.Scene,
  uniforms: Record<string, any>,
  totalPoints: number,
  treePosition: [number, number, number],
  sparkleTexture: THREE.Texture,
  sparkleTintUniforms: { uSparkleTint: { value: THREE.Color } },
  treeColorUniforms: {
    uTreeHueStart: { value: number }
    uTreeHueEnd: { value: number }
    uTreeSaturation: { value: number }
    uTreeLightness: { value: number }
  },
) {
  const vertexShader = `
  attribute float mIndex;
  varying vec3 vColor;
  varying float opacity;
  uniform sampler2D tAudioData;
  uniform float uTreeHueStart;
  uniform float uTreeHueEnd;
  uniform float uTreeSaturation;
  uniform float uTreeLightness;

  float norm(float value, float min, float max ){
      return (value - min) / (max - min);
  }
  float lerp(float n, float min, float max){
  return (max - min) * n + min;
  }

  float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){
  return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  }

  vec3 hsl2rgb(float h, float s, float l) {
    h = fract(h);
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 rgb;
    if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);
    return rgb + m;
  }

  void main() {
      float hue = mix(uTreeHueEnd, uTreeHueStart, mIndex);
      vColor = hsl2rgb(hue, uTreeSaturation, uTreeLightness);
      vec3 p = position;
      vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
      float amplitude = texture2D( tAudioData, vec2( mIndex, 0.1 ) ).r;
      float amplitudeClamped = clamp(amplitude-0.4,0.0, 0.6 );
      float sizeMapped = map(amplitudeClamped, 0.0, 0.6, 1.0, 20.0);
      opacity = map(mvPosition.z , -200.0, 15.0, 0.0, 1.0);
      gl_PointSize = sizeMapped * ( 100.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
  }`

  const fragmentShader = `
  uniform vec3 uSparkleTint;
  varying vec3 vColor;
  varying float opacity;
  uniform sampler2D pointTexture;
  void main() {
      vec3 tinted = vColor * uSparkleTint;
      gl_FragColor = vec4( tinted, opacity );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord ); 
  }`

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      ...sparkleTintUniforms,
      ...treeColorUniforms,
      pointTexture: {
        value: sparkleTexture,
      },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: false,
  })

  const geometry = new THREE.BufferGeometry()
  const positions: number[] = []
  const sizes: number[] = []
  const phases: number[] = []
  const mIndexs: number[] = []

  for (let i = 0; i < totalPoints; i++) {
    const t = Math.random()
    const y = map(t, 0, 1, -8, 10)
    const ang = map(t, 0, 1, 0, 6 * TAU) + (TAU / 2) * (i % 2)
    const [z, x] = polar(ang, map(t, 0, 1, 5, 0))

    const modifier = map(t, 0, 1, 1, 0)
    positions.push(x + rand(-0.3 * modifier, 0.3 * modifier))
    positions.push(y + rand(-0.3 * modifier, 0.3 * modifier))
    positions.push(z + rand(-0.3 * modifier, 0.3 * modifier))

    phases.push(rand(1000))
    sizes.push(1)

    const mIndex = map(i, 0, totalPoints, 1.0, 0.0)
    mIndexs.push(mIndex)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3).setUsage(
      THREE.DynamicDrawUsage,
    ),
  )
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
  geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
  geometry.setAttribute('mIndex', new THREE.Float32BufferAttribute(mIndexs, 1))

  const tree = new THREE.Points(geometry, shaderMaterial)
  const [px, py, pz] = treePosition
  tree.position.set(px, py, pz)

  scene.add(tree)
}

function addSnow(
  scene: THREE.Scene,
  uniforms: Record<string, any>,
  textures: THREE.Texture[],
  snowAppearanceUniforms: {
    uSnowSizeScale: { value: number }
    uSnowColor: { value: THREE.Color }
  },
  snowMaterialRefs: THREE.ShaderMaterial[],
) {
  const vertexShader = `
  attribute float size;
  attribute float phase;
  attribute float phaseSecondary;

  varying float opacity;

  uniform float time;
  uniform float step;
  uniform float uSnowSizeScale;

  float norm(float value, float min, float max ){
      return (value - min) / (max - min);
  }
  float lerp(float norm, float min, float max){
      return (max - min) * norm + min;
  }
  float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){
      return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  }
  void main() {
      float t = time* 0.0006;

      vec3 p = position;

      p.y = map(mod(phase+step, 1000.0), 0.0, 1000.0, 25.0, -8.0);
      p.x += sin(t+phase);
      p.z += sin(t+phaseSecondary);

      opacity = map(p.z, -150.0, 15.0, 0.0, 1.0);
      vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
      gl_PointSize = size * uSnowSizeScale * ( 100.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
  }`

  const fragmentShader = `
  uniform sampler2D pointTexture;
  uniform vec3 uSnowColor;
  varying float opacity;
  void main() {
      gl_FragColor = vec4( uSnowColor, opacity );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord ); 
  }`

  function createSnowSet(texture: THREE.Texture, setIndex: number) {
    const set = snowGlowEffectConfig.snow.sets[setIndex]
    const totalPoints = set?.points ?? 300
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        ...snowAppearanceUniforms,
        pointTexture: {
          value: texture,
        },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: false,
    })
    snowMaterialRefs.push(shaderMaterial)

    const geometry = new THREE.BufferGeometry()
    const positions: number[] = []
    const sizes: number[] = []
    const phases: number[] = []
    const phaseSecondaries: number[] = []

    for (let i = 0; i < totalPoints; i++) {
      const [x, y, z] = [rand(25, -25), 0, rand(15, -150)]
      positions.push(x, y, z)

      phases.push(rand(1000))
      phaseSecondaries.push(rand(1000))
      const min = set?.size.min ?? 2
      const max = set?.size.max ?? 4
      sizes.push(rand(max, min))
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
    geometry.setAttribute(
      'phaseSecondary',
      new THREE.Float32BufferAttribute(phaseSecondaries, 1),
    )

    const mesh = new THREE.Points(geometry, shaderMaterial)
    scene.add(mesh)
  }

  const setCount = snowGlowEffectConfig.snow.sets.length
  const n = Math.min(textures.length, setCount)
  for (let idx = 0; idx < n; idx++) {
    createSnowSet(textures[idx]!, idx)
  }
}

function addPlane(
  scene: THREE.Scene,
  uniforms: Record<string, any>,
  totalPoints: number,
  sparkleTexture: THREE.Texture,
  sparkleTintUniforms: { uSparkleTint: { value: THREE.Color } },
  planePaletteUniforms: {
    uPlaneColor0: { value: THREE.Color }
    uPlaneColor1: { value: THREE.Color }
    uPlaneColor2: { value: THREE.Color }
  },
): THREE.ShaderMaterial {
  const vertexShader = `
  attribute float size;
  attribute float paletteIx;
  varying float vPaletteIx;

  void main() {
      vPaletteIx = paletteIx;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
  }`

  const fragmentShader = `
  uniform sampler2D pointTexture;
  uniform vec3 uSparkleTint;
  uniform vec3 uPlaneColor0;
  uniform vec3 uPlaneColor1;
  uniform vec3 uPlaneColor2;
  varying float vPaletteIx;

  void main() {
      float pix = vPaletteIx;
      vec3 base;
      if (pix < 0.5) base = uPlaneColor0;
      else if (pix < 1.5) base = uPlaneColor1;
      else base = uPlaneColor2;
      vec3 tinted = base * uSparkleTint;
      gl_FragColor = vec4( tinted, 1.0 );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  }`

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      ...sparkleTintUniforms,
      ...planePaletteUniforms,
      pointTexture: {
        value: sparkleTexture,
      },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: false,
  })

  const geometry = new THREE.BufferGeometry()
  const positions: number[] = []
  const paletteIxs: number[] = []
  const sizes: number[] = []

  for (let i = 0; i < totalPoints; i++) {
    const [x, y, z] = [rand(-25, 25), 0, rand(-150, 15)]
    positions.push(x, y, z)
    paletteIxs.push(randInt(3))
    sizes.push(1)
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3).setUsage(
      THREE.DynamicDrawUsage,
    ),
  )
  geometry.setAttribute(
    'paletteIx',
    new THREE.Float32BufferAttribute(paletteIxs, 1),
  )
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

  const plane = new THREE.Points(geometry, shaderMaterial)
  plane.position.y = -8
  scene.add(plane)
  return shaderMaterial
}
