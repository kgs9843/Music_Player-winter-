import spark1Png from '@/assets/spark1.png'
import snowflake1Png from '@/assets/snow/snowflake1.png'
import snowflake2Png from '@/assets/snow/snowflake2.png'
import snowflake3Png from '@/assets/snow/snowflake3.png'
import snowflake4Png from '@/assets/snow/snowflake4.png'
import snowflake5Png from '@/assets/snow/snowflake5.png'

/** 눈/스파크 포인트 스프라이트 — `client/src/assets` 번들 경로 (Vite가 해석) */
export const winterTextureUrls = {
  sparkle: spark1Png,
  snowflakes: [
    snowflake1Png,
    snowflake2Png,
    snowflake3Png,
    snowflake4Png,
    snowflake5Png,
  ],
} as const

export type SnowGlowEffectConfig = {
  bloom: {
    threshold: number
    strength: number
    radius: number
  }
  snow: {
    sets: Array<{
      points: number
      size: { min: number; max: number }
      colors: string[]
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
    strength: 0.9,
    radius: 0.5,
  },
  snow: {
    sets: [
      {
        points: 300,
        size: { min: 3, max: 5 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
      },
      {
        points: 300,
        size: { min: 3, max: 5 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
      },
      {
        points: 300,
        size: { min: 3, max: 5 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
      },
      {
        points: 300,
        size: { min: 3, max: 5 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
      },
      {
        points: 300,
        size: { min: 3, max: 5 },
        colors: ['#f1d4d4', '#f1f6f9', '#eeeeee', '#f1f1e8'],
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
