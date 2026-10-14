# PR 본문 템플릿

언어별 섹션이 하나씩 있다. SKILL.md의 `PR_TEMPLATE_LANG` 값과 같은 섹션만 사용한다. 이 프로젝트는 `kr`.

- [kr (사용 중)](#kr)
- [en](#en)

---

## kr

```markdown
## 요약

<!-- 이 PR이 무엇을 왜 바꾸는지 1~3문장 -->

## 변경 사항

<!-- 핵심 변경을 목록으로. 파일 나열이 아니라 동작·구조 단위로 -->

-

## 변경 이유

<!-- 배경, 해결하려는 문제, 이 방식을 택한 이유 -->

## 테스트

<!-- 실행한 것만 적는다. 실행하지 않았으면 "미실행"과 사유 -->

- [ ] 테스트:
- [ ] 린트:
- [ ] 빌드:
- [ ] 수동 확인:

## 리뷰어 참고

<!-- 중점적으로 볼 부분, 알려진 한계, 후속 작업. 없으면 "해당 없음" -->
```

## en

```markdown
## Summary

<!-- What this PR changes and why, in 1-3 sentences -->

## Changes

<!-- Key changes as a list. Group by behavior/structure, not by file -->

-

## Motivation

<!-- Background, the problem being solved, why this approach -->

## Testing

<!-- List only what was actually run. Otherwise "Not run" with the reason -->

- [ ] Tests:
- [ ] Lint:
- [ ] Build:
- [ ] Manual check:

## Notes for reviewers

<!-- What to focus on, known limitations, follow-ups. "N/A" if none -->
```
