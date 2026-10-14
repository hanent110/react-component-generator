import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/storage';

const stored = {
  id: 'saved-1',
  prompt: '저장된 프롬프트',
  code: 'const A = () => null;\nrender(<A />);',
  createdAt: '2026-10-14T03:00:00.000Z',
};

const readStored = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.components) ?? 'null');

describe('useComponentGenerator 영속화', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('저장된 컴포넌트 목록을 Date 타입으로 복원해 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([stored]));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('저장된 값이 깨져 있으면 빈 목록으로 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.components, '{broken');
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toEqual([]);
  });

  it('생성에 성공하면 목록을 localStorage에 저장한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ code: 'new-code' }) })),
    );
    const { result } = renderHook(() => useComponentGenerator());
    await act(() => result.current.generate('새 프롬프트', undefined, 'google'));
    await waitFor(() => expect(readStored()).toHaveLength(1));
    expect(readStored()[0]).toMatchObject({ prompt: '새 프롬프트', code: 'new-code' });
  });

  it('컴포넌트를 삭제하면 저장된 목록에서도 사라진다', async () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([stored]));
    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.removeComponent('saved-1'));
    await waitFor(() => expect(readStored()).toEqual([]));
  });

  it('전체 삭제하면 저장된 목록도 비워진다', async () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([stored]));
    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.clearAll());
    await waitFor(() => expect(readStored()).toEqual([]));
  });
});
