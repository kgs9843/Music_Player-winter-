# 🎄 Music Player with SnowGlow Visualizer

[![GitHub stars](https://img.shields.io/github/stars/kgs9843/Music_Player-winter-?style=social)](https://github.com/kgs9843/Music_Player-winter-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/kgs9843/Music_Player-winter-?style=social)](https://github.com/kgs9843/Music_Player-winter-/network)
[![GitHub issues](https://img.shields.io/github/issues/kgs9843/Music_Player-winter-)](https://github.com/kgs9843/Music_Player-winter-/issues)

> 클론 코딩 기반의 오디오 시각화 웹사이트  
> [Original Codepen](https://codepen.io/dilums/pen/MWjEqaa)을 기반으로, **Vite + React + three.js**와 **Node.js(yt-dlp)** 서버로 확장했습니다.

---

## 📌 프로젝트 소개

음악(업로드 mp3 / YouTube 링크)의 주파수 분석을 기반으로 **겨울(눈 + 반짝임) SnowGlow 비주얼라이저**를 보여주는 웹 애플리케이션입니다.

### 🎯 주요 특징

- ✨ 원작 Codepen 예제를 최신 스택으로 모듈화/구조화
- 🎵 YouTube URL → 서버 변환 → 클라이언트 재생(진행률 % 표시)
- 📡 `yt-dlp` 기반 변환 + job/polling API
- 🧭 `<audio>` 스트리밍 재생으로 긴 mp3도 안정적으로 처리 + 시크(시간 이동) 지원
- 🐳 Docker Compose로 원클릭 실행

---

## 🚀 주요 기능

- 🔊 **실시간 오디오 시각화**: 음악 주파수에 반응하는 눈/반짝임 효과
- 🌐 **YouTube 통합**: URL 입력 → 진행률 표시 → 변환 완료 후 스트리밍 재생
- ⏱️ **시크/버퍼링 안정화**: 서버 오디오 엔드포인트가 **HTTP Range(206)** 지원
- 🎛️ **Visualizer 상단바**: Play/Pause, 시크바, 전체화면 토글

---

## 🗂️ 프로젝트 구조

```
.
├── docker-compose.yml
├── client/   # Vite + React + three.js
└── server/   # Express + yt-dlp
```

---

## ⚙️ 시작하기

### 🐳 Docker Compose로 실행 (권장)

```bash
docker compose up --build
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

종료:

```bash
docker compose down
```

볼륨까지 제거:

```bash
docker compose down -v
```

---

### 💻 로컬 개발 환경 실행

#### 1) Server

```bash
cd server
npm install
npm start
```

#### 2) Client (새 터미널)

```bash
cd client
npm install
npm run dev
```

---

## 🔧 환경변수

### Client

- `client/.env` (선택)
  - `VITE_API_BASE_URL` (기본값: `http://localhost:3000`)
  - 템플릿: `client/.env.example`

### Server

- `server/.env` (선택)
  - `YTDLP_COOKIES_FROM_BROWSER` (일부 URL에서 403/서명 문제 완화용, 로컬에서만 유효한 경우가 많음)
  - 템플릿: `server/.env.example`

---

## 🔌 API (서버)

- `POST /youtube/jobs` → `{ jobId }`
- `GET /youtube/jobs/:jobId` → `{ status, percent, stage, error? }`
- `GET /youtube/jobs/:jobId/audio` → mp3 스트리밍 (**Range 지원**)

레거시:

- `GET /extract-audio?url=<youtubeUrl>`

---

## 📚 문서

- Client: `client/README.md`
- Server: `server/README.md`

---

## 🙏 감사 인사 / Credits

- **Original Inspiration**: [dilums @ Codepen](https://codepen.io/dilums/pen/MWjEqaa)
