---
name: fsd-slices
description: >-
  Photo Guard Feature-Sliced Design slice layouts: ui, model, api segments and
  slice index.ts for pages, widgets, features, entities, shared under src/.
  Use when adding or restructuring a slice, scaffolding folders, or when the user
  mentions FSD, 슬라이스, 레이어, pages/widgets/features/entities/shared, or slice template.
---

# FSD 슬라이스 템플릿 (Photo Guard)

## 작업 전

1. 레이어 간 import 허용 범위는 `.cursor/rules/fsd-core.mdc`를 먼저 확인한다.
2. 아래 **레이어별 기본 트리**에 맞춰 디렉터리를 맞춘다(사용자가 별도로 정하지 않은 경우).

## 레이어별 기본 트리

### pages/

```
pages/
  Home/
    ui/
      HomeScreen.tsx
    model/
      useHomeViewModel.ts
    index.ts
```

### widgets/

```
widgets/
  UserSummary/
    ui/
      UserSummaryCard.tsx
    model/
      useUserSummary.ts
    index.ts
```

### features/

```
features/
  login/
    ui/
      LoginButton.tsx
    model/
      useLogin.ts
    api/
      loginApi.ts
    index.ts
```

### entities/

```
entities/
  user/
    model/
      types.ts
      useUserStore.ts
    api/
      fetchUser.ts
    ui/
      UserAvatar.tsx
    index.ts
```

### shared/

```
shared/
  api/
  config/
  libs/
  ui/
  hooks/
  utils/
```

## 운영 규칙

- **슬라이스 루트**: 레이어 아래 한 슬라이스는 폴더 하나로 두고, 다른 레이어에 노출할 API는 슬라이스 루트의 `index.ts`에서 re-export 한다.
- **세그먼트**: UI는 `ui/`, 훅·뷰 상태는 `model/`, HTTP 등은 해당 레이어에 `api/`가 있으면 그쪽에 둔다.
- **이름**: 같은 레이어 이웃 슬라이스와 스타일을 맞춘다(예: feature는 짧은 소문자 폴더명, 페이지·위젯·엔티티 예시는 PascalCase 등 레이어 관례 유지).
- **shared/**: 아래 트리에 있는 세그먼트(`api`, `config`, `libs`, `ui`, `hooks`, `utils`)만 사용하고, 합의 없이 `shared/` 아래 새 최상위 세그먼트를 만들지 않는다.

## 새 슬라이스 체크리스트

- [ ] `fsd-core.mdc` 의존성 표에 맞는 레이어를 골랐는지
- [ ] 해당 레이어 템플릿에 맞게 `ui/` · `model/` · `api/`만 필요한 만큼 썼는지
- [ ] 루트 `index.ts`가 하위 레이어가 import 해야 할 것만보내는지
- [ ] 상위 레이어를 import 하지 않았는지(의존성은 아래 방향만)

## 헷갈리면

위 **레이어별 기본 트리**에서 편집 중인 레이어(pages, widgets, features, entities, shared) 블록을 기준으로 맞춘다.
