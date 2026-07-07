import "server-only";
import type { LLMProvider } from "./types";
import { AnthropicProvider } from "./anthropic";

export { DEFAULT_MODEL } from "./model";
export type { LLMProvider } from "./types";

/**
 * 활성 LLM 제공자를 반환한다(서버 전용).
 * 현재 구현: Anthropic Claude. 교체 시 이 함수만 수정하면 된다(SPEC 0.2).
 */
export function getLLMProvider(): LLMProvider {
  return new AnthropicProvider();
}
