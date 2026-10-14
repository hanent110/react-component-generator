import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadFromStorage, saveToStorage } from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  describe('loadFromStorage', () => {
    it('저장된 값이 없으면 fallback을 반환한다', () => {
      expect(loadFromStorage('k', 'fallback')).toBe('fallback');
    });

    it('저장된 JSON을 파싱해 반환한다', () => {
      localStorage.setItem('k', JSON.stringify({ a: 1 }));
      expect(loadFromStorage('k', {})).toEqual({ a: 1 });
    });

    it('JSON이 깨져 있으면 fallback을 반환한다', () => {
      localStorage.setItem('k', '{broken');
      expect(loadFromStorage('k', 'fallback')).toBe('fallback');
    });

    it('localStorage 접근이 예외를 던지면 fallback을 반환한다', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(loadFromStorage('k', 'fallback')).toBe('fallback');
    });

    it('parse 함수가 있으면 파싱된 값을 변환해 반환한다', () => {
      localStorage.setItem('k', JSON.stringify(2));
      expect(loadFromStorage('k', 0, (raw) => (raw as number) * 10)).toBe(20);
    });

    it('parse 함수가 예외를 던지면 fallback을 반환한다', () => {
      localStorage.setItem('k', JSON.stringify('x'));
      const parse = () => {
        throw new Error('invalid');
      };
      expect(loadFromStorage('k', 'fallback', parse)).toBe('fallback');
    });
  });

  describe('saveToStorage', () => {
    it('값을 JSON으로 저장한다', () => {
      saveToStorage('k', { a: 1 });
      expect(localStorage.getItem('k')).toBe('{"a":1}');
    });

    it('저장이 실패해도(용량 초과 등) 예외를 던지지 않는다', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      expect(() => saveToStorage('k', 1)).not.toThrow();
    });
  });
});
