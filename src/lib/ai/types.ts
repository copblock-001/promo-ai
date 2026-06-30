/**
 * LLM 추상화 레이어 타입 (SPEC 0.2 · 부록 B).
 * 제공자(Anthropic 등)를 교체 가능하도록 인터페이스로 분리한다.
 * 실제 구현은 "AI 연동" 마일스톤에서 추가한다.
 */

export interface CopyGenerationContext {
  /** 프로모션 메타 (Step1~3) */
  name: string;
  brandName: string;
  purposeMain: "revenue" | "engagement";
  purposeDetail: "repurchase" | "new_product" | "discount" | "collab";
  prototypeType: "event" | "price" | "product";
  /** 대상 섹션 */
  componentType: string;
  variantId: string;
  /** 채워야 할 필드 키 목록 (부록 A 필드 스키마) */
  fields: string[];
}

/** 필드 키 → 생성된 한국어 카피 */
export type GeneratedCopy = Record<string, string>;

export interface LLMProvider {
  /** AI로 채우기: 섹션 필드용 카피 생성 (POST /api/ai/fill) */
  generateCopy(context: CopyGenerationContext): Promise<GeneratedCopy>;
}
