import type { LLMProvider } from "./types";

/**
 * 기본 LLM 모델 ID. 환경 변수로 재정의 가능(ANTHROPIC_MODEL).
 * 최신·고성능 Claude 모델을 기본값으로 사용한다.
 */
export const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

/**
 * 활성 LLM 제공자를 반환한다.
 * 부트스트랩 단계에서는 미구현 — "AI 연동" 마일스톤에서 Anthropic 구현체를 연결한다.
 * 키는 서버 라우트에서만 사용하며 클라이언트에 노출하지 않는다(SPEC 부록 B).
 */
export function getLLMProvider(): LLMProvider {
  // TODO(ai): "AI 연동" 마일스톤에서 Anthropic 기반 구현체로 교체.
  throw new Error(
    "[Promo.ai] LLM 제공자가 아직 구현되지 않았습니다. 'AI 연동' 마일스톤에서 추가됩니다.",
  );
}

export type { LLMProvider } from "./types";
