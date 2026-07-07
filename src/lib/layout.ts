import type { Layout, Section, Zone } from "@/types/promotion";
import { getComponentDef } from "@/lib/components/catalog";

/** 레이아웃(섹션 배열) 조작 유틸 — 모두 불변(immutable) 반환 */

const ZONE_ORDER: Record<Zone, number> = { top: 0, middle: 1, bottom: 2 };

function genId(type: string): string {
  return `sec_${type}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createSection(type: string): Section {
  const def = getComponentDef(type);
  if (!def) throw new Error(`알 수 없는 컴포넌트 타입: ${type}`);
  return {
    id: genId(type),
    zone: def.zone,
    fixed: def.fixed,
    componentType: type,
    variantId: def.variants[0].id,
    order: 0,
    content: structuredClone(def.defaultContent),
  };
}

/** zone 우선순위로 정렬 + zone별 order 재부여 (Array.sort는 안정 정렬) */
export function normalize(sections: Section[]): Section[] {
  const sorted = [...sections].sort(
    (a, b) => ZONE_ORDER[a.zone] - ZONE_ORDER[b.zone],
  );
  const counters: Partial<Record<Zone, number>> = {};
  return sorted.map((s) => {
    const order = counters[s.zone] ?? 0;
    counters[s.zone] = order + 1;
    return { ...s, order };
  });
}

export function addSection(layout: Layout, type: string): Layout {
  return { sections: normalize([...layout.sections, createSection(type)]) };
}

export function removeSection(layout: Layout, id: string): Layout {
  return { sections: normalize(layout.sections.filter((s) => s.id !== id)) };
}

export function setVariant(
  layout: Layout,
  id: string,
  variantId: string,
): Layout {
  return {
    sections: layout.sections.map((s) =>
      s.id === id ? { ...s, variantId } : s,
    ),
  };
}

export function updateContent(
  layout: Layout,
  id: string,
  content: Record<string, unknown>,
): Layout {
  return {
    sections: layout.sections.map((s) => (s.id === id ? { ...s, content } : s)),
  };
}

/** zone 내에서 위(-1)/아래(+1) 이동 */
export function moveSection(layout: Layout, id: string, dir: -1 | 1): Layout {
  const arr = [...layout.sections];
  const idx = arr.findIndex((s) => s.id === id);
  if (idx < 0) return layout;
  const zoneIdxs = arr
    .map((x, i) => ({ x, i }))
    .filter((o) => o.x.zone === arr[idx].zone)
    .map((o) => o.i);
  const pos = zoneIdxs.indexOf(idx);
  const target = pos + dir;
  if (target < 0 || target >= zoneIdxs.length) return layout;
  const targetIdx = zoneIdxs[target];
  [arr[idx], arr[targetIdx]] = [arr[targetIdx], arr[idx]];
  return { sections: normalize(arr) };
}

/** DnD 재배치 (같은 zone 내에서만) */
export function reorderSections(
  layout: Layout,
  activeId: string,
  overId: string,
): Layout {
  const arr = [...layout.sections];
  const from = arr.findIndex((s) => s.id === activeId);
  const to = arr.findIndex((s) => s.id === overId);
  if (from < 0 || to < 0) return layout;
  if (arr[from].zone !== arr[to].zone) return layout; // zone 경계 넘김 금지
  const [moved] = arr.splice(from, 1);
  arr.splice(to, 0, moved);
  return { sections: normalize(arr) };
}

/** 최소 구성(GNB + KV) 충족 여부 — Step4 [다음] 활성 조건 */
export function hasMinimum(layout: Layout): boolean {
  const types = new Set(layout.sections.map((s) => s.componentType));
  return types.has("GNB_LNB") && types.has("KV");
}

export function findSection(layout: Layout, id: string): Section | undefined {
  return layout.sections.find((s) => s.id === id);
}
