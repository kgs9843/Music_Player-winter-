# 🎄 Music Player with Christmas Tree Visualizer

[![GitHub stars](https://img.shields.io/github/stars/kgs9843/Music_Player-winter-?style=social)](https://github.com/kgs9843/Music_Player-winter-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/kgs9843/Music_Player-winter-?style=social)](https://github.com/kgs9843/Music_Player-winter-/network)
[![GitHub issues](https://img.shields.io/github/issues/kgs9843/Music_Player-winter-)](https://github.com/kgs9843/Music_Player-winter-/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 클론 코딩 기반의 오디오 시각화 웹사이트  
> [Original Codepen](https://codepen.io/dilums/pen/MWjEqaa)을 기반으로 최신 JavaScript 문법과 Node.js 서버를 활용해 확장

---

## 📌 프로젝트 소개

이 프로젝트는 음악의 주파수 분석을 기반으로 **밝기와 색상을 조절하는 크리스마스트리 스타일의 비주얼라이저** 웹 애플리케이션입니다.

### 🎯 주요 특징

- ✨ 원작 Codepen 예제를 최신 ES6 `import` 문법을 활용하여 모듈화 및 구조화
- 🎵 Node.js 서버를 추가하여 **YouTube URL을 입력하면 해당 음악을 재생**할 수 있도록 기능 확장
- 📡 `yt-dlp` 라이브러리를 활용해 유튜브 오디오를 다운로드하고 스트리밍
- 🐳 **Docker Compose로 원클릭 실행** - 복잡한 설정 없이 바로 시작!

---

## 🚀 주요 기능

- 🔊 **실시간 오디오 시각화**: 음악의 주파수에 따라 조명이 밝아지며 춤추는 시각 효과
- 🌐 **YouTube 통합**: 유튜브 URL 입력 시 해당 음악 자동 재생
- 🖥️ **마이크로서비스 아키텍처**: 클라이언트-서버 구조로 분리된 프로젝트 구성 (프론트 + 백엔드)
- 🐳 **Docker 지원**: Docker Compose를 통한 원클릭 배포 및 실행

---

## 🗂️ 프로젝트 구조

```
music_play/
├── 🐳 docker-compose.yml     # Docker Compose 설정 파일
├── 📁 client/               # 프론트엔드 (Vite 기반)
│   ├── 🐳 Dockerfile
│   ├── 📂 public/
│   ├── 📂 src/
│   ├── 📄 package.json
│   └── 📄 vite.config.js
├── 📁 server/               # 백엔드 (Node.js + yt-dlp)
│   ├── 🐳 Dockerfile
│   ├── 📄 server.js
│   └── 📄 package.json
└── 📄 README.md
```

### 🐳 Docker 구성

- **Frontend Container**: Vite 개발 서버 (포트 5173)
- **Backend Container**: Express API 서버 (포트 3000)
- **Volume Mount**: 소스 코드 실시간 반영
- **Network**: 컨테이너 간 통신을 위한 브리지 네트워크

---

## ⚙️ 시작하기

### 🐳 Docker Compose로 간편 실행 (권장)

Docker가 설치되어 있다면 **한 번의 명령**으로 전체 애플리케이션을 실행할 수 있습니다!

```bash
# 레포지토리 클론
git clone https://github.com/kgs9843/Music_Player-winter-.git
cd Music_Player-winter-

# Docker Compose로 실행
docker-compose up -d
```

**접속 주소:**
- 🌐 애플리케이션: http://localhost:5173
- 📡 API 서버: http://localhost:3000

```bash
# 종료
docker-compose down
```

---

### 💻 로컬 개발 환경 실행

#### 📋 사전 요구사항

- Node.js (v14 이상)
- npm 또는 yarn
- Python (yt-dlp를 위해 필요)
- yt-dlp 설치

```bash
# yt-dlp 설치 (macOS)
brew install yt-dlp

# yt-dlp 설치 (Windows)
pip install yt-dlp

# yt-dlp 설치 (Linux)
sudo apt install yt-dlp
```

#### 🚀 수동 설치 및 실행

1. **레포지토리 클론**
   ```bash
   git clone https://github.com/kgs9843/Music_Player-winter-.git
   cd Music_Player-winter-
   ```

2. **서버 실행**
   ```bash
   cd server
   npm install
   npm start
   ```

3. **클라이언트 실행** (새 터미널 창에서)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **브라우저에서 접속**
   - 클라이언트: http://localhost:5173
   - 서버: http://localhost:3000

---

## 📦 기술 스택

<table>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white"/>
      <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white"/>
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
    </td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
      <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <td><strong>DevOps</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/>
      <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white"/>
    </td>
  </tr>
  <tr>
    <td><strong>Tools</strong></td>
    <td>
      <img src="https://img.shields.io/badge/yt--dlp-FF0000?style=flat-square&logo=youtube&logoColor=white"/>
      <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
    </td>
  </tr>
</table>

### 주요 라이브러리

#### 프론트엔드 (Client)
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Three.js** - 3D 그래픽 및 시각화 라이브러리
- **Web Audio API** - 오디오 분석 및 처리

#### 백엔드 (Server)
- **Node.js** - JavaScript 런타임
- **Express** - 웹 애플리케이션 프레임워크
- **yt-dlp** - 유튜브 오디오 추출 도구

#### DevOps
- **Docker** - 컨테이너화 및 배포
- **Docker Compose** - 멀티 컨테이너 오케스트레이션

> ⚠️ **Docker 사용 시**: 모든 종속성이 자동으로 설치되므로 별도의 yt-dlp 설치가 불필요합니다!  
> 💻 **로컬 개발 시**: yt-dlp는 Python 기반 툴이므로 수동 설치가 필요합니다.

---

## 📸 데모


<div align="center">
<img width="2470" height="1141" alt="image" src="https://github.com/user-attachments/assets/e0ed979f-b93b-482c-a185-64902a55db01" />
</div>  

*🎄 크리스마스 트리 비주얼라이저 실행 화면*

</div>

## 🎮 사용법

1. **음악 재생**: YouTube URL을 입력하고 재생 버튼을 클릭
2. **시각화 효과**: 음악의 주파수에 따라 트리의 조명이 반응
3. **컨트롤**: 볼륨 조절 및 재생/일시정지 가능

---

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## 🐛 이슈 및 버그 리포트

문제를 발견하셨나요? [Issues](https://github.com/kgs9843/Music_Player-winter-/issues)에 리포트해주세요!

---

## ⭐ 지원

이 프로젝트가 도움이 되셨다면 ⭐를 눌러주세요!

---

## 👨‍💻 개발자

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/kgs9843">
        <img src="https://github.com/kgs9843.png" width="100px;" alt="kgs9843"/>
        <br />
        <sub><b>kgs9843</b></sub>
      </a>
      <br />
      <a href="https://github.com/kgs9843" title="Code">💻</a>
    </td>
  </tr>
</table>

### 🙏 감사 인사

- **Original Inspiration**: [dilums @ Codepen](https://codepen.io/dilums/pen/MWjEqaa)
- **Three.js Community**: 3D 그래픽 라이브러리 제공
- **yt-dlp Developers**: 유튜브 오디오 추출 도구 제공

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

<div align="center">
  
**🎄 즐거운 코딩 되세요! 🎄**

Made with ❤️ by [kgs9843](https://github.com/kgs9843)

</div>
