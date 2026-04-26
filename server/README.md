# SnowGlow (Server)

YouTube URL을 **mp3로 변환**하고, 변환 진행률을 **job/polling**으로 제공하는 Express 서버입니다.

## 요구 사항

- Node.js (권장: 최신 LTS)

## 시작하기

```bash
npm install
npm start
```

기본 접속:

- `http://localhost:3000`

## API

### Job 기반 YouTube 변환(권장)

- `POST /youtube/jobs`
  - body: `{ "url": "<youtubeUrl>" }`
  - response: `{ "jobId": "<uuid>" }`

- `GET /youtube/jobs/:jobId`
  - response: `{ status, percent, stage, error? }`

- `GET /youtube/jobs/:jobId/audio`
  - 변환 완료 후 mp3를 스트리밍합니다.
  - **HTTP Range(206)** 를 지원해 브라우저 `<audio>` 시크/버퍼링이 안정적입니다.
  - 임시 mp3는 서버에서 일정 시간(기본 **24시간**) 보관 후 삭제됩니다(TTL).
  - **seek/Range 요청으로 TTL은 갱신(연장)되지 않습니다.**

### 레거시

- `GET /extract-audio?url=<youtubeUrl>`
  - 단발 변환 후 파일을 전송하고 즉시 삭제합니다.
  - 현재 클라이언트 UI는 job 플로우를 사용합니다.

## 환경변수

- `YTDLP_COOKIES_FROM_BROWSER` (선택)
  - yt-dlp에 `--cookies-from-browser`로 전달할 값
  - 예: `chrome`, `chrome:Default`, `edge`, 등(환경/브라우저에 따라 다름)
  - 일부 영상에서 403/서명 문제를 완화하는 데 도움이 될 수 있습니다.
  - 템플릿: `.env.example`

## CORS

기본 설정은 Vite 개발 서버(`http://localhost:5173`)만 허용합니다.
배포 환경에서는 `server.js`의 CORS origin을 환경에 맞게 조정하세요.

