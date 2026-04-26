# SnowGlow

업로드한 mp3 또는 YouTube 링크를 재생하면서, **겨울(눈 + 반짝임) Three.js 비주얼라이저**를 보여주는 프로젝트입니다.

- **Client**: Vite + React + three.js (`client/`)
- **Server**: Express + yt-dlp (`server/`)

## 빠른 시작 (로컬)

### 1) Server

```bash
cd server
npm install
npm start
```

- 기본: `http://localhost:3000`

### 2) Client

```bash
cd client
npm install
npm run dev
```

- 기본: `http://localhost:5173`

## Docker Compose

```bash
docker compose up --build
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

정리:

```bash
docker compose down
```

볼륨까지 제거:

```bash
docker compose down -v
```

## 환경변수

### Client (`client/.env`)

- `VITE_API_BASE_URL`
  - 백엔드 base URL
  - 기본값(미설정 시): `http://localhost:3000`
  - 예시: `VITE_API_BASE_URL=http://localhost:3000`
  - 템플릿: `client/.env.example`

### Server (`server/.env` 등)

- `YTDLP_COOKIES_FROM_BROWSER` (선택)
  - 일부 영상에서 403/서명 문제를 완화하는 데 도움이 될 수 있습니다.
  - 값 형식은 환경/브라우저마다 다를 수 있습니다. (`server/README.md` 참고)

## 주요 기능

- **YouTube 변환 진행률(%)**: job 생성 → 폴링 → 완료 시 mp3 스트리밍
- **오디오 시크/버퍼링 안정화**: 서버 `/youtube/jobs/:jobId/audio`가 **HTTP Range(206)** 지원
- **긴 mp3 안정 재생**: 클라이언트는 `decodeAudioData` 대신 `<audio>` 스트리밍 경로를 사용(YouTube/업로드 mp3)
- **Visualizer 상단바**: Play/Pause, 시크바, 전체화면 토글

## 문서

- Client 문서: `client/README.md`
- Server 문서: `server/README.md`

