import { describe, it, expect } from 'vitest';
import { parseProvider, parseApiKeys, parseStringArray, parseComponents } from './parsers';

describe('parseProvider', () => {
  it('유효한 provider 값을 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
  });

  it('알 수 없는 값이면 예외를 던진다', () => {
    expect(() => parseProvider('openai')).toThrow();
    expect(() => parseProvider(42)).toThrow();
  });
});

describe('parseApiKeys', () => {
  it('provider별 문자열 키를 반환한다', () => {
    expect(parseApiKeys({ anthropic: 'a', google: 'g' })).toEqual({ anthropic: 'a', google: 'g' });
  });

  it('누락된 provider는 빈 문자열로 채운다', () => {
    expect(parseApiKeys({ google: 'g' })).toEqual({ anthropic: '', google: 'g' });
  });

  it('문자열이 아닌 값은 빈 문자열로 대체한다', () => {
    expect(parseApiKeys({ anthropic: 1, google: null })).toEqual({ anthropic: '', google: '' });
  });

  it('객체가 아니면 예외를 던진다', () => {
    expect(() => parseApiKeys('x')).toThrow();
    expect(() => parseApiKeys(null)).toThrow();
  });
});

describe('parseStringArray', () => {
  it('문자열 배열을 그대로 반환한다', () => {
    expect(parseStringArray(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('문자열이 아닌 요소는 걸러낸다', () => {
    expect(parseStringArray(['a', 1, null, 'b'])).toEqual(['a', 'b']);
  });

  it('배열이 아니면 예외를 던진다', () => {
    expect(() => parseStringArray('a')).toThrow();
  });
});

describe('parseComponents', () => {
  it('createdAt 문자열을 Date로 복원한다', () => {
    const iso = '2026-10-14T03:00:00.000Z';
    const [c] = parseComponents([{ id: '1', prompt: 'p', code: 'c', createdAt: iso }]);
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.toISOString()).toBe(iso);
  });

  it('필드가 올바르지 않은 항목은 걸러낸다', () => {
    const valid = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-10-14T03:00:00.000Z' };
    const result = parseComponents([valid, { id: 2 }, null, { ...valid, createdAt: 'not-a-date' }]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('배열이 아니면 예외를 던진다', () => {
    expect(() => parseComponents({})).toThrow();
  });
});
