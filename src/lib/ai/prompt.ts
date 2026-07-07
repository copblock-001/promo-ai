import type { CopyGenerationContext } from "./types";
import {
  PROTOTYPE_LABEL,
  PURPOSE_DETAIL_LABEL,
  PURPOSE_MAIN_LABEL,
} from "@/lib/labels";

/** AI 카피 생성 프롬프트 (SPEC 부록 B-1). 한국어 카피, JSON만 반환. */

export const FILL_SYSTEM_PROMPT = `당신은 한국의 숙련된 프로모션 카피라이터입니다.
브랜드 프로모션 원페이지에 들어갈 짧고 매력적인 한국어 카피를 작성합니다.

규칙:
- 반드시 한국어로 작성합니다.
- 과장·허위·금칙 표현을 피하고, 자연스럽고 신뢰감 있는 톤을 사용합니다.
- headline 류는 20자 내외, description 류는 60자 내외, button 류는 10자 내외로 간결하게 작성합니다.
- 요청된 JSON 필드만 채우며, 각 값은 순수 텍스트(마크다운/따옴표 장식 없이)로 작성합니다.`;

export function buildFillUserPrompt(ctx: CopyGenerationContext): string {
  const purposeMain = PURPOSE_MAIN_LABEL[ctx.purposeMain];
  const purposeDetail = PURPOSE_DETAIL_LABEL[ctx.purposeDetail];
  const prototype = PROTOTYPE_LABEL[ctx.prototypeType];

  return [
    `프로모션 정보:`,
    `- 프로모션명: ${ctx.name || "(미입력)"}`,
    `- 브랜드: ${ctx.brandName || "(미입력)"}`,
    `- 목적: ${purposeMain} / ${purposeDetail}`,
    `- 프로토타입 유형: ${prototype}`,
    `- 대상 컴포넌트: ${ctx.componentType} (${ctx.variantId})`,
    ``,
    `아래 필드에 어울리는 한국어 카피를 작성해 JSON으로 반환하세요.`,
    `필드: ${ctx.fields.join(", ")}`,
  ].join("\n");
}

/** 요청 필드로 structured output JSON 스키마 구성 (모두 문자열) */
export function buildCopySchema(fields: string[]) {
  return {
    type: "object",
    properties: Object.fromEntries(
      fields.map((key) => [key, { type: "string" }]),
    ),
    required: fields,
    additionalProperties: false,
  };
}
