import type { Layout, PrototypeType } from "@/types/promotion";
import { createSection, normalize } from "@/lib/layout";

/**
 * 프로토타입 초기 레이아웃 프리셋 (SPEC 부록 F).
 * Step3에서 프로토타입 선택 → Step4 진입 시 초기 layout.sections 로 세팅.
 * Top(GNB_LNB, KV)은 항상 포함·고정.
 */
export const PROTOTYPE_PRESETS: Record<PrototypeType, string[]> = {
  event: ["GNB_LNB", "KV", "KVTabContainer", "ContentsCard", "FAQ", "Disclaimer"],
  price: ["GNB_LNB", "KV", "ProductCard", "RTB", "ContentsCard", "Disclaimer"],
  product: [
    "GNB_LNB",
    "KV",
    "Video",
    "ProductCard",
    "RTB",
    "FAQ",
    "Disclaimer",
  ],
};

export function presetLayout(type: PrototypeType): Layout {
  return { sections: normalize(PROTOTYPE_PRESETS[type].map(createSection)) };
}

/** 레이아웃이 비어있거나(편집 전) 어떤 프리셋과 동일한 구성이면 true. */
export function isPresetOrEmpty(layout: Layout): boolean {
  if (layout.sections.length === 0) return true;
  const seq = layout.sections.map((s) => s.componentType).join(",");
  return Object.values(PROTOTYPE_PRESETS).some((p) => p.join(",") === seq);
}
