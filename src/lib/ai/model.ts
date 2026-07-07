/**
 * 기본 LLM 모델 ID. 환경 변수 ANTHROPIC_MODEL로 재정의 가능.
 * 최신·고성능 Claude 모델을 기본값으로 사용한다.
 */
export const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
