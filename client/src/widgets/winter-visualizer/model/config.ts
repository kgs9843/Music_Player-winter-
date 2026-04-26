import spark1Png from '@/assets/spark1.png'
import snowflake1Png from '@/assets/snow/snowflake1.png'
import snowflake2Png from '@/assets/snow/snowflake2.png'
import snowflake3Png from '@/assets/snow/snowflake3.png'
import snowflake4Png from '@/assets/snow/snowflake4.png'
import snowflake5Png from '@/assets/snow/snowflake5.png'

import type { WinterAppearanceSettings } from './appearance'

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
      { points: 300, size: { min: 3, max: 5 } },
      { points: 300, size: { min: 3, max: 5 } },
      { points: 300, size: { min: 3, max: 5 } },
      { points: 300, size: { min: 3, max: 5 } },
      { points: 300, size: { min: 3, max: 5 } },
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

/** 지면 스파클 3색 기본값 (`getDefaultWinterAppearance().shader.planeColors`) */
export const winterPlaneSparklePalette = [
  '#93abd3',
  '#f2f4c0',
  '#9ddfd3',
] as const

/**
 * 비주얼 설정 UI에서 눈 기본값.
 * sizeScale 1 = `snow.sets[].size`로 생성된 포인트 그대로.
 */
export const winterAppearanceUiDefaults = {
  shader: {
    tintHex: '#ffffff',
    tree: {
      hueStart: 1,
      hueEnd: 0,
      saturation: 1,
      lightness: 0.5,
    },
    planeColors: [...winterPlaneSparklePalette] as [
      string,
      string,
      string,
    ],
  },
  snow: {
    sizeScale: 1,
    colorHex: '#f1f6f9',
  },
} as const

/** bloom·셰이더·눈 UI 기본값 — bloom은 항상 `snowGlowEffectConfig.bloom`과 동일 */
export function getDefaultWinterAppearance(): WinterAppearanceSettings {
  return {
    bloom: {
      threshold: snowGlowEffectConfig.bloom.threshold,
      strength: snowGlowEffectConfig.bloom.strength,
      radius: snowGlowEffectConfig.bloom.radius,
    },
    shader: {
      tintHex: winterAppearanceUiDefaults.shader.tintHex,
      tree: { ...winterAppearanceUiDefaults.shader.tree },
      planeColors: [...winterAppearanceUiDefaults.shader.planeColors] as [
        string,
        string,
        string,
      ],
    },
    snow: {
      sizeScale: winterAppearanceUiDefaults.snow.sizeScale,
      colorHex: winterAppearanceUiDefaults.snow.colorHex,
    },
  }
}
