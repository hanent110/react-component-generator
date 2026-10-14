// localStorage는 비공개 모드·용량 초과·차단 설정에서 예외를 던질 수 있다.
// 영속화 실패가 앱 동작을 막지 않도록 모든 접근을 try/catch로 감싼다.

export const STORAGE_KEYS = {
  apiKeys: 'rcg:apiKeys',
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;

export function loadFromStorage<T>(key: string, fallback: T, parse?: (raw: unknown) => T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const raw: unknown = JSON.parse(stored);
    return parse ? parse(raw) : (raw as T);
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다. 상태는 메모리에 그대로 남는다.
  }
}
