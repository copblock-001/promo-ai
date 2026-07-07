import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { CopyGenerationContext, GeneratedCopy, LLMProvider } from "./types";
import { DEFAULT_MODEL } from "./model";
import {
  FILL_SYSTEM_PROMPT,
  buildCopySchema,
  buildFillUserPrompt,
} from "./prompt";

/**
 * Anthropic Claude 기반 LLM 구현체 (서버 전용).
 * 키는 ANTHROPIC_API_KEY 환경 변수에서만 읽으며 클라이언트에 노출되지 않는다.
 */
export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[Promo.ai] 환경 변수 ANTHROPIC_API_KEY 가 설정되지 않았습니다 (SPEC 0.4).",
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async generateCopy(context: CopyGenerationContext): Promise<GeneratedCopy> {
    const schema = buildCopySchema(context.fields);

    const response = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1024,
      system: FILL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildFillUserPrompt(context) }],
      // structured outputs로 유효한 JSON 보장 (SPEC 부록 B: JSON만 반환)
      output_config: {
        format: { type: "json_schema", schema },
      },
    } as Anthropic.Messages.MessageCreateParamsNonStreaming);

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return parseCopy(text, context.fields);
  }
}

/** 코드펜스 등 방어적으로 제거 후 JSON 파싱 → 요청 필드만 문자열로 반환 */
function parseCopy(text: string, fields: string[]): GeneratedCopy {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("AI 응답을 해석하지 못했습니다. 다시 시도해주세요.");
  }

  const result: GeneratedCopy = {};
  for (const key of fields) {
    const value = data[key];
    if (typeof value === "string") result[key] = value;
  }
  return result;
}
