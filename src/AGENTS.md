# src/AGENTS.md

## Module Context

Vite + React 19 프론트엔드. `/api/*` 호출은 Vite 프록시를 통해 서버(3002)로 간다 (`vite.config.ts:9-14`). 상태는 `useComponentGenerator` 훅 하나가 관리한다.

## Tech Stack & Constraints

- 미리보기는 react-live를 쓴다. `LiveProvider`는 `noInline`이어야 한다 (`components/LivePreview.tsx:14`). 이유는 루트 AGENTS.md 참조.
- tsconfig는 `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`가 켜져 있다 (`tsconfig.app.json:14-23`). 타입만 가져올 때는 `import type`을 쓴다 (`App.tsx:5`의 패턴).
- 상태관리 라이브러리와 데이터 패칭 라이브러리는 없다. 추가하지 않고 `fetch` + 훅 패턴을 유지한다 (`hooks/useComponentGenerator.ts:23`).

## Implementation Patterns

- 컴포넌트는 `components/`에 named export로 만들고 (`export function PromptInput`), props 인터페이스를 파일 상단에 둔다.
- 서버 호출은 훅 안에서만 한다. 컴포넌트가 직접 `/api/generate`를 호출하지 않는다. 예외는 마운트 시 한 번 호출하는 `/api/config` (`App.tsx:25`).
- 스타일은 `App.css`의 클래스명을 쓴다. 생성된 컴포넌트가 인라인 스타일만 쓰는 것(서버 프롬프트 규칙)과 혼동하지 않는다.

## Testing Strategy

- 실행: `bunx vitest run src/`. 환경은 jsdom이고 각 테스트 후 `cleanup()`이 자동 호출된다 (`test/setup.ts:6-8`). 테스트 파일에서 `cleanup`을 다시 호출하지 않는다.
- 쿼리는 Testing Library의 role 기반을 쓴다 (`PromptInput.test.tsx`의 `getByRole('button', { name })`). 클릭 같은 상호작용은 `userEvent.setup()`을 쓴다.
- 현재 테스트가 있는 것은 `PromptInput`뿐이다. 훅, `App`, `ComponentCard`를 고칠 때는 수동으로 `bun run dev`에서 확인하거나 테스트를 새로 추가한다.

## Local Golden Rules

- Security Boundary: API 키는 provider별로 분리해 보관하고 localStorage에만 영속화한다(사용자 결정, 정정 2026-10-14: 기존에는 영속 저장 금지였음). 선택된 provider의 키만 `/api/generate`로 보낸다. 키 형식이 provider마다 다르기 때문이다 (`App.tsx:9-12`). 키 값을 로그·에러 메시지에 쓰지 않는다.
- Double Defense: 키 누락 검사가 `handleGenerate`(`App.tsx:34`)에도 있고 서버에도 있다. 클라이언트 검사는 UX용이므로 서버 응답의 `data.error`를 그대로 표시하는 경로(`useComponentGenerator.ts:32`)도 유지한다.
- Hard Constraint: `LivePreview`의 `LiveError`는 생성 코드의 런타임 오류를 화면에 보여주는 유일한 경로다 (`LivePreview.tsx:18`). 제거하면 AI가 잘못된 코드를 만들었을 때 빈 화면만 보인다.
