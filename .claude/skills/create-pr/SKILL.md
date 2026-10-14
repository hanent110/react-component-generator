---
name: create-pr
description: |
  현재 브랜치의 커밋과 diff를 분석해 PR 템플릿(references/pr-template-kr.md)에 맞춰 제목과 본문을 작성하고 GitHub Pull Request를 생성한다.
  "PR 만들어줘", "PR 올려줘", "풀리퀘스트 생성", "PR 해줘", "create a PR", "open a pull request", "/create-pr" 같은 요청에는 직접 `gh pr create`를 치지 말고 반드시 이 스킬을 사용한다.
  커밋은 이미 끝난 상태를 전제로 하며, 커밋 자체는 commit 스킬이 담당한다.
context: fork
allowed-tools: Read Glob Grep Bash
---

# create-pr: 브랜치 분석 → 템플릿 본문 작성 → PR 생성

포크된 컨텍스트에서 실행된다. 사용자에게 중간 질문을 할 수 없으므로, 판단이 필요한 지점은 아래 "중단 조건"으로 처리하고 결과만 간결하게 보고한다.

## 설정

- **PR_TEMPLATE_LANG: `kr`** — 이 프로젝트는 한국어 템플릿을 쓴다. 언어별로 파일이 분리되어 있다 — `references/pr-template-kr.md`만 읽고 `references/pr-template-en.md`는 읽지 않는다. 영어로 바꾸려면 이 값을 `en`으로 고친다(그러면 `-en` 파일만 읽는다).
- **기본 base 브랜치: `main`**

## Step 0: 저장소 지침 확인

`AGENTS.md`(없으면 `CLAUDE.md`)에 PR·브랜치·커밋 규칙이 있으면 이 스킬보다 우선한다.

## Step 1: 상태 확인

```bash
git branch --show-current
git status --short
git remote get-url origin
git log --oneline origin/main..HEAD   # base 와의 차이 (base 가 다르면 교체)
git diff --stat origin/main...HEAD
```

중단 조건에 해당하면 PR을 만들지 않고 사유와 해결 방법을 보고한다.

- 현재 브랜치가 base 브랜치(`main`)다. PR은 작업 브랜치에서 만든다. 브랜치 이름 제안과 함께 알린다.
- base와 비교해 커밋 차이가 없다.
- 커밋되지 않은 변경이 있다. PR에 포함되지 않으므로 알리고, 커밋이 필요하면 commit 스킬을 쓰라고 안내한다. (변경이 무관한 파일뿐이면 경고만 하고 진행해도 된다.)
- 같은 브랜치의 열린 PR이 이미 있다 (`gh pr list --head <브랜치> --state open`). 새로 만들지 않고 URL을 보고한다.

## Step 2: 변경 분석

- `git log origin/main..HEAD` 로 커밋 메시지를 모두 읽고, `git diff origin/main...HEAD` 로 실제 변경을 확인한다. 커밋 메시지만 보고 요약하지 않는다 — 메시지가 내용을 정확히 담지 않는 경우가 있다.
- diff가 크면 `--stat`으로 윤곽을 잡고 핵심 파일만 읽는다.
- "무엇을" 보다 **"왜"** 가 드러나게 정리한다. 변경 이유는 커밋 메시지, 코드 주석, 관련 문서에서 찾고, 찾을 수 없는 것은 추측해 적지 않는다.
- 테스트·린트·빌드는 **실제로 실행한 것만** 결과를 적는다. package.json의 스크립트를 확인해 실행하고, 실행하지 않은 항목은 "미실행"으로 적는다.
- 비밀값(키·토큰)이 diff에 보이면 PR을 만들지 않고 파일명과 행 번호만 보고한다. 값은 출력하지 않는다.

## Step 3: 제목과 본문 작성

1. `references/pr-template-<PR_TEMPLATE_LANG>.md` 파일(현재 `pr-template-kr.md`)만 읽는다. 다른 언어 파일은 열지 않는다.
2. 템플릿의 섹션 구조와 순서를 그대로 유지하고 내용을 채운다. 해당 없는 섹션은 지우지 말고 "해당 없음"으로 적는다 — 리뷰어가 누락과 해당 없음을 구분할 수 있어야 한다.
3. 제목은 `type: 한국어 요약.` 형식(feat/fix/refactor/chore/docs/test/style)으로 70자 이내. 커밋이 하나면 그 메시지를 그대로 쓴다.
4. 본문은 임시 파일 없이 heredoc으로 `--body-file -`에 전달한다. 따옴표·백틱이 깨지지 않게 하기 위해서다.

## Step 4: 푸시와 PR 생성

사용자가 PR 생성을 요청했으므로 별도 승인 없이 진행한다.

```bash
git push -u origin <현재브랜치>
gh pr create --base main --head <현재브랜치> --title "<제목>" --body-file - <<'EOF'
<본문>
EOF
```

- **호스트를 확인한다.** `origin` URL의 호스트가 `github.com`이 아니면(예: 사내 GHE) `GH_HOST=<호스트>`를 앞에 붙인다. 이 환경은 `gh`에 호스트가 둘 이상 로그인되어 있을 수 있다.
- 이미 원격에 있는 브랜치를 `--force`로 푸시하지 않는다. 거절되면 원인을 보고한다.
- 사용자가 "draft"를 언급했을 때만 `--draft`를 붙인다.
- 실패하면 오류 메시지를 그대로 보고하고 재시도 전에 원인을 설명한다.

## Step 5: 결과 보고

PR URL, 제목, base ← head, 커밋 수, 실행한 검증 결과를 짧게 보고한다. 본문 전체를 다시 출력하지 않는다.

```
PR 생성 완료
- https://github.com/OWNER/REPO/pull/12
- feat: 프롬프트 500자 검증 추가.  (main ← feature/prompt-limit, 커밋 2개)
- 검증: test 통과 / lint 통과 / build 통과
```
