export const MAX_PROMPT_LENGTH = 500;

export interface PromptValidation {
  valid: boolean;
  error?: string;
}

/** 프롬프트 길이를 검증한다. 앞뒤 공백은 제외하고 센다 (제출 시 trim하므로). */
export function validatePrompt(prompt: string): PromptValidation {
  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `프롬프트는 ${MAX_PROMPT_LENGTH}자 이하로 입력해주세요.` };
  }
  return { valid: true };
}
