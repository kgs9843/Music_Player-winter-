import * as THREE from 'three'

type SpriteOptions = {
  size?: number
  colorStops: Array<{ at: number; color: string; alpha: number }>
}

export function createRadialSpriteTexture({
  size = 128,
  colorStops,
}: SpriteOptions) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is not available')
  }

  const cx = size / 2
  const cy = size / 2
  const r = size / 2

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  for (const stop of colorStops) {
    grad.addColorStop(stop.at, withAlpha(stop.color, stop.alpha))
  }

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function withAlpha(hex: string, alpha: number) {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
