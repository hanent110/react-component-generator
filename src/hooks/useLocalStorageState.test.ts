import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorageState } from './useLocalStorageState';

describe('useLocalStorageState', () => {
  beforeEach(() => localStorage.clear());

  it('저장된 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => useLocalStorageState('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 초기값 대신 그 값으로 시작한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorageState('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => useLocalStorageState('k', 'init'));
    act(() => result.current[1]('next'));
    expect(result.current[0]).toBe('next');
    expect(localStorage.getItem('k')).toBe('"next"');
  });

  it('함수형 업데이트를 지원한다', () => {
    const { result } = renderHook(() => useLocalStorageState('k', 1));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  it('parse가 예외를 던지면 초기값으로 시작한다', () => {
    localStorage.setItem('k', JSON.stringify('bad'));
    const parse = () => {
      throw new Error('invalid');
    };
    const { result } = renderHook(() => useLocalStorageState('k', 'init', parse));
    expect(result.current[0]).toBe('init');
  });
});
