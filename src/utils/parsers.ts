import type { GeneratedComponent, Provider } from '../types';

// localStorage 값은 외부 입력이므로 형태를 검증한다.
// 복구 불가능하면 예외를 던지고, loadFromStorage가 fallback으로 처리한다.

const PROVIDERS: readonly Provider[] = ['anthropic', 'google'];

export function parseProvider(raw: unknown): Provider {
  if (PROVIDERS.includes(raw as Provider)) return raw as Provider;
  throw new Error('Invalid provider');
}

export function parseApiKeys(raw: unknown): Record<Provider, string> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Invalid api keys');
  }
  const record = raw as Record<string, unknown>;
  const pick = (provider: Provider) =>
    typeof record[provider] === 'string' ? (record[provider] as string) : '';
  return { anthropic: pick('anthropic'), google: pick('google') };
}

export function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) throw new Error('Invalid string array');
  return raw.filter((item): item is string => typeof item === 'string');
}

export function parseComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) throw new Error('Invalid components');
  return raw.flatMap((item): GeneratedComponent[] => {
    if (typeof item !== 'object' || item === null) return [];
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') return [];
    if (typeof createdAt !== 'string') return [];
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return [];
    return [{ id, prompt, code, createdAt: date }];
  });
}
