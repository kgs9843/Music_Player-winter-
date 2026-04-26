# SnowGlow (Client)

음악(업로드 mp3 / YouTube 링크)에 반응하는 **겨울(눈 + 반짝임) Three.js 비주얼라이저** 프론트엔드입니다.

## 핵심 링크(SoT)

- Product: `docs/product/README.md`
- Design System: `docs/design/design-system.md`
- Architecture(FSD): `docs/architecture/README.md`
- External references: `docs/references/README.md`

## 요구 사항

- Node.js (권장: 최신 LTS)

## 시작하기

```bash
npm install
npm run dev
```

기본 접속:

- `http://localhost:5173`

## 검증 게이트

```bash
npm run verify
```

포맷만 깨지면:

```bash
npm run format
npm run verify
```

## 라우트

- `/`: 메인(프리셋 선택 / mp3 업로드 / YouTube URL 입력)
- `/visualizer`: 비주얼라이저 화면

## 업로드 제한

- 업로드는 **mp3만 허용**합니다.
  - `<input accept=".mp3,audio/mpeg">` + 런타임 확장자/MIME 체크

## YouTube 변환(백엔드 필요)

프론트는 아래 엔드포인트를 호출합니다. 기본값은 개발 환경에서 `http://localhost:3000`이고, 배포 환경에선 환경변수로 변경합니다.

- `POST ${VITE_API_BASE_URL}/youtube/jobs` body: `{ "url": "<youtubeUrl>" }` → `{ jobId }`
- `GET  ${VITE_API_BASE_URL}/youtube/jobs/:jobId` → `{ status, percent, stage, error? }`
- `GET  ${VITE_API_BASE_URL}/youtube/jobs/:jobId/audio` → mp3 (완료 후, Range 지원)

참고:

- `GET ${VITE_API_BASE_URL}/extract-audio?url=<youtubeUrl>` 는 레거시 엔드포인트이며, 현재 UI는 job 기반 플로우를 사용합니다.

### 환경변수

- `.env.example` 참고
- `VITE_API_BASE_URL`: 백엔드 base URL (예: `https://api.snowglow.app`)

## 재생 컨트롤

- YouTube/업로드 mp3는 `<audio>` 스트리밍으로 재생하며 상단바 **Play/Pause + 시크바**로 탐색할 수 있습니다.
- 상단바 오른쪽의 버튼으로 **전체화면 토글**이 가능합니다.

## 이펙트 설정(눈/반짝/Bloom)

비주얼 파라미터는 아래 파일에서 한 번에 조절합니다.

- `src/widgets/winter-visualizer/model/config.ts` (`snowGlowEffectConfig`)
