export type WinterAppearanceSettings = {
  bloom: {
    threshold: number
    strength: number
    radius: number
  }
  shader: {
    /** 트리·지면 스파클에 곱하는 전역 틴트 */
    tintHex: string
    /** 트리 포인트: mIndex 따라 hue가 보간됨 (0~1) */
    tree: {
      hueStart: number
      hueEnd: number
      saturation: number
      lightness: number
    }
    /** 지면 스파클 3색 (입자마다 랜덤 선택) */
    planeColors: [string, string, string]
  }
  snow: {
    sizeScale: number
    colorHex: string
  }
}
