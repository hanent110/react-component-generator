import { describe, it, expect } from 'vitest';
import { addToHistory, MAX_HISTORY } from './promptHistory';

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('앞뒤 공백을 제거해 저장한다', () => {
    expect(addToHistory([], '  hello  ')).toEqual(['hello']);
  });

  it('빈 프롬프트는 추가하지 않는다', () => {
    const history = ['a'];
    expect(addToHistory(history, '   ')).toBe(history);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addToHistory(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it(`최대 ${MAX_HISTORY}개까지만 유지하고 오래된 것부터 버린다`, () => {
    const history = Array.from({ length: MAX_HISTORY }, (_, i) => `p${i}`);
    const result = addToHistory(history, 'new');
    expect(result).toHaveLength(MAX_HISTORY);
    expect(result[0]).toBe('new');
    expect(result).not.toContain(`p${MAX_HISTORY - 1}`);
  });
});
