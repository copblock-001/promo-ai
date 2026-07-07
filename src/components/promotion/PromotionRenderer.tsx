import type { Section } from "@/types/promotion";
import { renderSection } from "./registry";

/** 조립된 프로모션 페이지 렌더(읽기 전용) — 프리뷰/결과물에서 재사용 */
export function PromotionRenderer({ sections }: { sections: Section[] }) {
  if (sections.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center text-sm text-text-sub">
        섹션이 없습니다.
      </div>
    );
  }
  return (
    <div className="bg-surface">
      {sections.map((s) => (
        <div key={s.id}>
          {renderSection(s.componentType, s.content, s.variantId)}
        </div>
      ))}
    </div>
  );
}
