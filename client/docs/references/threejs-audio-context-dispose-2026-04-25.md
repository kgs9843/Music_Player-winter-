# three.js AudioContext dispose 메모 (2026-04-25)

## 적용 범위

- 프로젝트: **SnowGlow** (Vite + three.js WebAudio)
- 적용 대상 코드: `src/widgets/winter-visualizer/ui/createWinterVisualizer.ts`

## 결론 (3–7줄)

- three.js의 `AudioListener`는 보통 앱에서 **하나만 생성**하고(카메라에 붙여) 공용으로 쓰는 전제를 갖습니다.
- `AudioListener.context`로 노출되는 `AudioContext`에 대해, 화면 전환/언마운트 시점에 **`close()`를 호출하면** 이후 오디오 재생이 **영구적으로 깨질 수** 있습니다(컨텍스트가 닫히기 때문).
- 리소스 정리는 `audio.stop()` / `disconnect()` / 렌더 루프 중지 / WebGL 리소스 dispose로 처리하고,
- 컨텍스트는 `suspend()` / 재생 직전에 `resume()`로 상태를 관리하는 편이 안전합니다.

## 참고 문서

- three.js `AudioListener.context` (공식): `https://threejs.org/docs/#api/en/audio/AudioListener.context`
- three.js `AudioListener` (공식): `https://threejs.org/docs/pages/AudioListener.html`
- MDN `AudioContext.close()` (공식): `https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/close`
