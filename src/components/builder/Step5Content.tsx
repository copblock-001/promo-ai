"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "@/store/wizard";
import { findSection, updateContent } from "@/lib/layout";
import { getComponentDef } from "@/lib/components/catalog";
import { renderSection } from "@/components/promotion/registry";
import { SectionFields } from "./SectionFields";

/** SCR-07 · Step5 콘텐츠 입력 (좌측 동적 필드 ↔ 우측 실시간 프리뷰, 양방향) */
export function Step5Content() {
  const layout = useWizard((s) => s.layout);
  const promotionId = useWizard((s) => s.id);
  const patch = useWizard((s) => s.patch);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 기본 선택: 첫 섹션
  useEffect(() => {
    if (!selectedId && layout.sections.length > 0) {
      setSelectedId(layout.sections[0].id);
    }
  }, [layout.sections, selectedId]);

  const selected = selectedId ? findSection(layout, selectedId) : undefined;
  const def = selected ? getComponentDef(selected.componentType) : undefined;

  function onFieldChange(content: Record<string, unknown>) {
    if (!selected) return;
    patch({ layout: updateContent(layout, selected.id, content) });
  }

  async function handleAiFill() {
    if (!selected || !promotionId) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionId, sectionId: selected.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "AI 생성에 실패했습니다.");
      const content = selected.content as Record<string, unknown>;
      onFieldChange({ ...content, ...(data.copy ?? {}) });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI 생성에 실패했습니다.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-61px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
      {/* 좌측 입력 패널 */}
      <aside className="flex flex-col overflow-y-auto border-r border-border bg-surface">
        <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">콘텐츠 입력</h2>
            <p className="text-xs text-text-sub">
              콘텐츠의 내용을 입력해서 프로모션을 완성하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiFill}
            disabled={aiLoading || !selected}
            className="flex shrink-0 items-center gap-1 rounded-pill bg-primary-weak px-3 py-1.5 text-sm font-medium text-primary disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiLoading ? "생성 중..." : "AI로 채우기"}
          </button>
        </div>

        <div className="p-5">
          {selected && def ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-pill bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {selected.variantId}
                </span>
                <span className="text-sm text-text-sub">{def.label}</span>
              </div>
              {aiError && (
                <p className="mb-4 rounded-input bg-red-50 px-3 py-2 text-sm text-red-600">
                  {aiError}
                </p>
              )}
              <SectionFields section={selected} onChange={onFieldChange} />
            </>
          ) : (
            <p className="text-sm text-text-sub">
              오른쪽 프리뷰에서 편집할 섹션을 선택하세요.
            </p>
          )}
        </div>
      </aside>

      {/* 우측 실시간 프리뷰 */}
      <section className="overflow-y-auto bg-bg p-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-card border border-border bg-surface shadow-sm">
          {layout.sections.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "relative cursor-pointer",
                selectedId === s.id && "ring-2 ring-inset ring-primary",
              )}
            >
              <div className="pointer-events-none">
                {renderSection(s.componentType, s.content, s.variantId)}
              </div>
              {selectedId === s.id && (
                <span className="absolute left-2 top-2 z-10 rounded-pill bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {s.variantId}
                </span>
              )}
            </div>
          ))}
          {layout.sections.length === 0 && (
            <div className="p-12 text-center text-sm text-text-sub">
              구성된 섹션이 없습니다. Step4에서 컴포넌트를 추가하세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
