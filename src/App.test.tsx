import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS } from './utils/storage';

const read = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

function mockFetch(envKeys = { anthropic: false, google: true }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/api/config') return { ok: true, json: async () => ({ envKeys }) };
      return { ok: true, json: async () => ({ code: 'const A = () => null;\nrender(<A />);' }) };
    }),
  );
}

describe('App 상태 영속화', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('저장된 Provider로 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('anthropic'));
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });

  it('Provider를 바꾸면 localStorage에 저장한다', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(read(STORAGE_KEYS.provider)).toBe('anthropic');
  });

  it('API 키를 provider별로 저장하고 새로고침 후에도 복원한다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(screen.getByLabelText('API Key'), 'google-test-key');
    expect(read(STORAGE_KEYS.apiKeys)).toEqual({ anthropic: '', google: 'google-test-key' });

    first.unmount();
    render(<App />);
    expect(screen.getByLabelText('API Key')).toHaveValue('google-test-key');
  });

  it('Provider를 전환하면 해당 provider의 키만 보이고 다른 키는 유지된다', async () => {
    localStorage.setItem(
      STORAGE_KEYS.apiKeys,
      JSON.stringify({ anthropic: 'anthropic-test-key', google: 'google-test-key' }),
    );
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByLabelText('API Key')).toHaveValue('google-test-key');

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('anthropic-test-key');
    expect(read(STORAGE_KEYS.apiKeys).google).toBe('google-test-key');
  });

  it('선택한 provider의 키만 생성 요청에 보낸다', async () => {
    localStorage.setItem(
      STORAGE_KEYS.apiKeys,
      JSON.stringify({ anthropic: 'anthropic-test-key', google: 'google-test-key' }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: '' }), '카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    const generateCall = vi.mocked(fetch).mock.calls.find(([url]) => url === '/api/generate');
    const body = JSON.parse(String(generateCall?.[1]?.body));
    expect(body).toMatchObject({ provider: 'google', apiKey: 'google-test-key' });
  });

  it('생성한 프롬프트를 히스토리에 저장하고 새로고침 후에도 보여준다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(screen.getByRole('textbox', { name: '' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    await waitFor(() => expect(read(STORAGE_KEYS.promptHistory)).toEqual(['프로필 카드']));

    first.unmount();
    render(<App />);
    const region = screen.getByRole('region', { name: '최근 프롬프트' });
    expect(region).toHaveTextContent('프로필 카드');
  });

  it('기록 삭제를 누르면 히스토리가 비워진다', async () => {
    localStorage.setItem(STORAGE_KEYS.promptHistory, JSON.stringify(['a', 'b']));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '기록 삭제' }));
    expect(read(STORAGE_KEYS.promptHistory)).toEqual([]);
    expect(screen.queryByRole('region', { name: '최근 프롬프트' })).not.toBeInTheDocument();
  });
});
