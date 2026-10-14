import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

/** useState와 같은 인터페이스에 localStorage 영속화를 더한 훅. 첫 렌더에서 저장값을 읽고, 값이 바뀔 때마다 저장한다. */
export function useLocalStorageState<T>(key: string, initial: T, parse?: (raw: unknown) => T) {
  const [state, setState] = useState<T>(() => loadFromStorage(key, initial, parse));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState] as const;
}
