# AGENTS.md — SnowGlow 작업 지도

이 문서는 **SnowGlow** 레포에서 “지금 무엇을 어디서 보면 되는지”와 “내가 실제로 하는 작업 순서”만 담습니다.

- **워크트리 사용 안 함**
- **내 로컬에서 실행하는 흐름**만 기록
- 규칙은 문서보다 **검증(`npm run verify`)**로 강제

---

## SoT(단일 진실) 문서

- `docs/index.md`: `docs/` 전체 목차
- `docs/product/README.md`: 제품 한 줄, 사용자 여정
- `docs/design/design-system.md`: **UI/디자인 시스템 SoT**
- `docs/architecture/README.md`: FSD 배경/운영 관점 (규칙은 `.cursor/rules/fsd-core.mdc`)
- `scripts/README.md`: 검증 스크립트 요약

---

## 구조 규칙 (FSD)

이 레포는 Feature-Sliced Design(FSD)을 따릅니다.

```
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

- 레이어 의존성 규칙은 `.cursor/rules/fsd-core.mdc`를 SoT로 둡니다.

---

## 내가 하는 로컬 작업 흐름

### 1) 설치

```bash
npm install
```

### 2) 개발 서버

```bash
npm run dev
```

### 3) 검증 게이트 (반드시 통과)

```bash
npm run verify
```

- `format:check`만 실패하면:

```bash
npm run format
npm run verify
```

---

## 이름/브랜딩

- 프로젝트 표시 이름: **SnowGlow**
- 브랜딩/톤은 `docs/design/design-system.md`를 따른다.
