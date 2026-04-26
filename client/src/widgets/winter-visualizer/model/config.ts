export type SnowGlowEffectConfig = {
  bloom: {
    threshold: number
    strength: number
    radius: number
  }
  sparkle: {
    colorStops: Array<{ at: number; color: string; alpha: number }>
  }
  snow: {
    sets: Array<{
      points: number
      size: { min: number; max: number }
      colors: string[]
      textureStops: Array<{ at: number; color: string; alpha: number }>
    }>
  }
  scene: {
    trees: {
      rows: number
      pointsPerTree: number
    }
    planePoints: number
  }
}

export const snowGlowEffectConfig: SnowGlowEffectConfig = {
  bloom: {
    threshold: 0,
    strength: 0.7,
    radius: 0.5,
  },
  sparkle: {
    colorStops: [
      { at: 0.0, color: '#ffffff', alpha: 1 },
      { at: 0.2, color: '#ffffff', alpha: 0.9 },
      { at: 0.6, color: '#bfe9ff', alpha: 0.25 },
      { at: 1.0, color: '#000000', alpha: 0 },
    ],
  },
  snow: {
    sets: [
      {
        points: 300,
        size: { min: 2, max: 4 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
        textureStops: [
          { at: 0.0, color: '#ffffff', alpha: 1 },
          { at: 0.5, color: '#ffffff', alpha: 0.35 },
          { at: 1.0, color: '#000000', alpha: 0 },
        ],
      },
      {
        points: 300,
        size: { min: 2, max: 4 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
        textureStops: [
          { at: 0.0, color: '#f1f6f9', alpha: 1 },
          { at: 0.55, color: '#f1f6f9', alpha: 0.25 },
          { at: 1.0, color: '#000000', alpha: 0 },
        ],
      },
    ],
  },
  scene: {
    trees: {
      rows: 10,
      pointsPerTree: 4000,
    },
    planePoints: 3000,
  },
}
