# server/AGENTS.md

## Module Context

Bun으로 실행되는 AI API 프록시. `/api/config`, `/api/generate` 두 엔드포인트만 제공하고, 응답 정규화는 `generator.ts`, 모델 폴백은 `fallback.ts`가 맡는다.

## Tech Stack & Constraints

- 외부 SDK 없이 `fetch`로 Anthropic/Gemini REST를 직접 호출한다 (`index.ts:69`, `index.ts:99`). SDK를 추가하지 않는다.
- `Provider` 타입이 `src/types/index.ts`와 `index.ts:57`에 중복 정의되어 있다. 서버는 `src/`를 import하지 않는다. 값을 추가하면 양쪽을 함께 고친다.
- 이 디렉토리는 tsc 대상이 아니다 (루트 AGENTS.md 참조). 타입 오류가 빌드에서 잡히지 않는다.

## Implementation Patterns

- 순수 함수는 `Bun.serve`가 없는 별도 파일로 두고 같은 이름의 `*.test.ts`를 옆에 둔다 (`fallback.ts` / `fallback.test.ts`).
- 모든 응답에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`). 새 `Response`를 만들 때 누락하지 않는다.
- 모델 추가/교체: Google은 `GOOGLE_MODELS` 배열 (`index.ts:5`, 앞쪽이 우선순위), Anthropic은 `callAnthropic` 안의 하드코딩 모델 ID (`index.ts:77`).

## Testing Strategy

- `bunx vitest run server/` 로 실행한다.
- 테스트는 실제 네트워크를 호출하지 않는다. 폴백 테스트는 `vi.fn`으로 `attempt`를 주입한다 (`fallback.test.ts`).

## Local Golden Rules

- Asymmetry: 폴백과 `MAX_TOKENS` 처리는 Google 경로에만 있다. Anthropic 경로(`index.ts:68-96`)는 단일 모델이며 잘림 검사가 없고, `max_tokens`도 4096으로 Google의 8192(`index.ts:107`)와 다르다. 두 경로를 같다고 가정하고 고치지 않는다. 한쪽 변경이 다른 쪽에도 필요한지 먼저 판단한다.
- Hard Constraint: HTTP 상태 매핑은 에러 메시지 문자열에 상태 코드가 포함되어 있는지로 판정한다 (`index.ts:194`, `index.ts:201`의 `message.includes('503'|'429')`). 에러 메시지 형식 `... API error: ${status}` (`index.ts:85`, `index.ts:112`)에서 상태 코드를 빼지 않는다. `withModelFallback`은 마지막 에러를 던지므로 (`fallback.ts:19`) 마지막 모델의 상태 코드만 사용자에게 전달된다.
- Double Defense: 코드 펜스와 `render()` 호출은 시스템 프롬프트로 한 번 요구하고 (`index.ts:12`, `index.ts:16`), 서버에서 `stripCodeFences`/`ensureRenderCall`로 다시 보정한다 (`index.ts:188`). 프롬프트 규칙이 있다고 보정 함수를 제거하지 않는다.
- Double Defense: API 키 누락은 서버(`index.ts:169`)와 클라이언트(`src/App.tsx:34`) 양쪽에서 검사한다. 서버 검사를 클라이언트가 대신한다고 가정하지 않는다.
- Security Boundary: Google 호출은 키를 URL 쿼리에 넣는다 (`index.ts:99`). 이 URL을 로그, 에러 메시지, 응답에 포함하지 않는다. 현재 에러는 상태 코드만 담는다 (`index.ts:112`). 이 형식을 유지한다.
- Security Boundary: `Access-Control-Allow-Origin: *` (`index.ts:52`)는 로컬 개발 전제다. 서버를 외부에 배포하는 변경이라면 서버 `.env` 키가 노출되는 경로이므로 CORS를 먼저 제한한다.
