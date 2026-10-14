# AGENTS.md

## Operational Commands

패키지 매니저는 bun 고정 (`bun.lock`). npm/yarn/pnpm 사용 금지.

- 개발 서버 (API + Vite 동시): `bun run dev` (`package.json:7`)
- API 서버만: `bun run server` (`bun --watch run server/index.ts`)
- 전체 테스트: `bun run test` (vitest run). `bun test`는 bun 자체 러너를 호출하므로 쓰지 않는다.
- 단일 테스트: `bunx vitest run server/fallback.test.ts`
- 린트: `bun run lint`
- 타입체크 + 빌드: `bun run build` (`tsc -b && vite build`)

변경 후 완료 보고 전에 `bun run test`, `bun run lint`, `bun run build`를 실행해 결과를 확인한다.

## Golden Rules

### Immutable

- API 키 값은 서버 환경변수(`ENV_KEYS`, `server/index.ts:59-62`)와 요청 본문, 그리고 클라이언트의 localStorage(사용자 결정으로 허용)에만 존재한다. 서버 응답, 서버 로그, URL 쿼리스트링(클라이언트 측), sessionStorage·쿠키에는 키 값을 쓰지 않는다.
  - **정정 (2026-10-14)**: 기존에는 localStorage도 금지였으나, 새로고침 후 상태 유지를 위해 사용자가 API 키의 localStorage 저장을 요청해 허용으로 바꿨다. 키는 provider별로 분리해 저장하고(`rcg:apiKeys`), 로그와 에러 메시지에는 여전히 쓰지 않는다.
  - `/api/config`는 키 보유 여부(boolean)만 반환한다 (`server/index.ts:150-153`). 값을 반환하도록 바꾸지 않는다.
  - 클라이언트 키는 provider별로 분리해 보관한다(전환 시 다른 provider의 키를 보내지 않기 위해).
- `.env`는 커밋하지 않는다 (`.gitignore:32`). 워크트리에는 `.worktreeinclude`로만 복사된다.
- `hiring-lab/resumes/`는 `.gitignore`에 등록되어 있다. 해당 디렉토리의 파일을 `git add`하지 않는다.

### Hard Constraints

- 생성 코드는 react-live `noInline` 모드에서 실행된다 (`src/components/LivePreview.tsx:14`). 이 때문에 생성 코드는 (a) import 문 없음, (b) 끝에 `render(<Component />)` 호출, (c) 순수 JavaScript(TS 문법 금지)여야 한다 (`server/index.ts:11,12,20`). 시스템 프롬프트 규칙을 완화하거나 `LivePreview`의 모드를 바꾸면 미리보기가 깨진다. 둘 중 한쪽만 수정하지 않는다.
- Vite 프록시 대상 포트와 서버 포트는 같아야 한다: `server/index.ts:139`(3002) = `vite.config.ts:11`. 한쪽만 바꾸지 않는다.
- `tsconfig.app.json:23`에 `erasableSyntaxOnly`가 켜져 있다. `enum`, `namespace`, 생성자 매개변수 프로퍼티를 쓰지 않는다.

### Test Boundary

- 테스트가 있는 곳: `server/fallback.ts`, `server/generator.ts`, `src/components/PromptInput.tsx`. 나머지(`server/index.ts`, `App.tsx`, `useComponentGenerator.ts`, `ComponentCard`, `LivePreview`, `CodeView`)는 테스트가 없다.
- `server/index.ts`는 최상위에서 `Bun.serve`를 실행하므로 import만으로 서버가 뜬다. 테스트가 필요한 순수 로직은 `generator.ts`/`fallback.ts`처럼 별도 모듈로 분리해서 테스트한다 (`server/generator.ts:1-2` 주석).
- vitest는 bun이 아닌 Node + jsdom에서 돈다 (`vite.config.ts:17`). 테스트 대상 모듈에서 `Bun.*` 전역을 참조하지 않는다.

### Verification

- `server/` 디렉토리는 어떤 tsconfig의 `include`에도 없다 (`tsconfig.app.json:28`은 `src`만, `tsconfig.node.json:25`는 `vite.config.ts`만). `bun run build`는 server 코드를 타입체크하지 않는다. server 변경 시 에디터 진단 또는 `bunx tsc --noEmit --skipLibCheck --target ES2023 --moduleResolution bundler --module esnext --types bun server/index.ts`로 별도 확인한다.

## Project Context

프롬프트를 받아 AI가 생성한 React 컴포넌트를 미리보기와 코드로 보여주는 도구.

Tech Stack: React 19, TypeScript, Vite, Bun(API 프록시), react-live, vitest + Testing Library.

`hiring-lab/`은 별도의 이력서 검토 실습 자료다 (`hiring-lab/README.md`). 컴포넌트 생성기 코드와 무관하며, 스킬은 `.claude/skills/resume-screening/`에 있다.

## Standards & References

- 커밋: `type: 한국어 요약.` 한 줄 (feat/fix/refactor/chore/docs/test/style). `Co-Authored-By` 트레일러 없음. 의미 단위로 분리하고 `git add`는 명시적 경로로만 한다. 절차는 `.claude/skills/commit/SKILL.md`.
- 주석과 UI 문구는 한국어, 식별자는 영어.
- 실행 방법과 기능 설명은 `README.md`를 따른다.

## Maintenance Policy

이 문서의 규칙과 코드가 어긋나는 것을 발견하면 작업을 멈추지 말고 수정안을 제안한다. 규칙이 인용한 파일·라인이 바뀌었으면 인용을 갱신한다.

## Context Map

- **[서버 수정 (API 프록시, 모델 폴백, 에러 매핑)](./server/AGENTS.md)** — `server/` 아래 파일을 고칠 때.
- **[프론트엔드 수정 (UI, 훅, 미리보기)](./src/AGENTS.md)** — `src/` 아래 파일을 고칠 때.
