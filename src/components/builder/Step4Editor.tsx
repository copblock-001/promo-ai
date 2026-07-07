"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  GripVertical,
  Info,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "@/store/wizard";
import {
  ZONES,
  componentsByZone,
  getComponentDef,
} from "@/lib/components/catalog";
import {
  addSection,
  createSection,
  findSection,
  moveSection,
  normalize,
  removeSection,
  setVariant,
} from "@/lib/layout";
import { renderSection } from "@/components/promotion/registry";
import type { Layout, Section } from "@/types/promotion";

/** SCR-06 · Step4 컴포넌트 수정 (3패널 에디터) */
export function Step4Editor() {
  const layout = useWizard((s) => s.layout);
  const patch = useWizard((s) => s.patch);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedType, setFocusedType] = useState<string | null>(null);

  const setLayout = (next: Layout) => patch({ layout: next });
  const selected = selectedId ? findSection(layout, selectedId) : undefined;
  const swapMode = Boolean(selected && selected.componentType === focusedType);

  function selectSection(id: string) {
    const s = findSection(layout, id);
    setSelectedId(id);
    if (s) setFocusedType(s.componentType);
  }

  function focusType(type: string) {
    setFocusedType(type);
    setSelectedId(null);
  }

  function handleVariant(variantId: string) {
    if (!focusedType) return;
    if (swapMode && selected) {
      setLayout(setVariant(layout, selected.id, variantId));
    } else {
      // 새 섹션 추가 후 선택
      const section = { ...createSection(focusedType), variantId };
      const next = { sections: normalize([...layout.sections, section]) };
      setLayout(next);
      setSelectedId(section.id);
    }
  }

  function addOfType(type: string) {
    const before = new Set(layout.sections.map((s) => s.id));
    const next = addSection(layout, type);
    setLayout(next);
    const created = next.sections.find((s) => !before.has(s.id));
    if (created) {
      setSelectedId(created.id);
      setFocusedType(type);
    }
  }

  function onMove(id: string, dir: -1 | 1) {
    setLayout(moveSection(layout, id, dir));
  }
  function onDelete(id: string) {
    setLayout(removeSection(layout, id));
    if (selectedId === id) setSelectedId(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    // 같은 zone 내 재배치
    const arr = [...layout.sections];
    const from = arr.findIndex((s) => s.id === active.id);
    const to = arr.findIndex((s) => s.id === over.id);
    if (from < 0 || to < 0 || arr[from].zone !== arr[to].zone) return;
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setLayout({ sections: normalize(arr) });
  }

  const nonFixedIds = layout.sections
    .filter((s) => !s.fixed)
    .map((s) => s.id);

  return (
    <div className="grid h-[calc(100vh-61px)] grid-cols-1 lg:grid-cols-[260px_260px_1fr]">
      {/* ① 컴포넌트 목록 */}
      <aside className="hidden flex-col overflow-y-auto border-r border-border bg-surface lg:flex">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <h2 className="font-semibold">컴포넌트 수정</h2>
          <span title="Fixed 섹션은 위치 고정, Adjustable 섹션은 자유 배치">
            <Info className="h-4 w-4 text-text-sub" />
          </span>
        </div>
        <div className="flex flex-col gap-4 p-3">
          {ZONES.map(({ zone, label, note }) => (
            <div key={zone} className="flex flex-col gap-1">
              <p className="px-1 text-xs font-medium text-text-sub">
                {label} <span className="text-primary">* {note}</span>
              </p>
              {componentsByZone(zone).map((def) => (
                <div
                  key={def.type}
                  className={cn(
                    "flex items-center rounded-input px-2 py-2 text-sm hover:bg-bg",
                    focusedType === def.type && "bg-primary-weak",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => focusType(def.type)}
                    className="flex flex-1 items-center gap-1 text-left"
                  >
                    {def.label}
                    <span className="text-xs text-text-sub">
                      ({def.variants.length})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addOfType(def.type)}
                    title="추가"
                    className="text-text-sub hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-text-sub" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* ② 변형 선택 */}
      <aside className="hidden flex-col overflow-y-auto border-r border-border bg-bg lg:flex">
        {focusedType ? (
          <VariantPanel
            type={focusedType}
            swapMode={swapMode}
            currentVariant={selected?.variantId}
            onPick={handleVariant}
            onClose={() => setFocusedType(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-sub">
            왼쪽에서 컴포넌트를 선택하면
            <br />
            변형을 고를 수 있어요.
          </div>
        )}
      </aside>

      {/* ③ 실시간 프리뷰 */}
      <section className="overflow-y-auto bg-bg p-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-card border border-border bg-surface shadow-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={nonFixedIds}
              strategy={verticalListSortingStrategy}
            >
              {layout.sections.map((section) => (
                <SectionFrame
                  key={section.id}
                  section={section}
                  selected={selectedId === section.id}
                  onSelect={() => selectSection(section.id)}
                  onMove={onMove}
                  onDelete={onDelete}
                  canUp={canMove(layout, section, -1)}
                  canDown={canMove(layout, section, 1)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {layout.sections.length === 0 && (
            <div className="p-12 text-center text-sm text-text-sub">
              왼쪽에서 컴포넌트를 추가해 프로모션을 구성하세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function canMove(layout: Layout, section: Section, dir: -1 | 1): boolean {
  if (section.fixed) return false;
  const zoneSecs = layout.sections.filter((s) => s.zone === section.zone);
  const pos = zoneSecs.findIndex((s) => s.id === section.id);
  return dir === -1 ? pos > 0 : pos < zoneSecs.length - 1;
}

function VariantPanel({
  type,
  swapMode,
  currentVariant,
  onPick,
  onClose,
}: {
  type: string;
  swapMode: boolean;
  currentVariant?: string;
  onPick: (variantId: string) => void;
  onClose: () => void;
}) {
  const def = getComponentDef(type);
  if (!def) return null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex flex-col">
          <span className="font-semibold">{def.label}</span>
          <span className="text-xs text-text-sub">
            {swapMode ? "변형 교체" : "새 섹션 추가"}
          </span>
        </div>
        <button type="button" onClick={onClose} className="text-text-sub">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-3 p-3">
        {def.variants.map((v) => {
          const active = swapMode && currentVariant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onPick(v.id)}
              className={cn(
                "flex flex-col gap-2 rounded-card border p-3 text-left",
                active
                  ? "border-primary ring-2 ring-primary"
                  : "border-border bg-surface hover:border-primary",
              )}
            >
              {/* TODO(asset): 변형 썸네일 이미지 */}
              <div className="flex h-20 items-center justify-center rounded-input bg-primary-weak text-xs text-primary/60">
                {v.id}
              </div>
              <span className="text-sm font-medium">{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionFrame({
  section,
  selected,
  onSelect,
  onMove,
  onDelete,
  canUp,
  canDown,
}: {
  section: Section;
  selected: boolean;
  onSelect: () => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  canUp: boolean;
  canDown: boolean;
}) {
  const sortable = useSortable({ id: section.id, disabled: section.fixed });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer",
        selected && "ring-2 ring-inset ring-primary",
        sortable.isDragging && "opacity-60",
      )}
    >
      {/* 렌더된 실제 컴포넌트 */}
      <div className="pointer-events-none">
        {renderSection(section.componentType, section.content, section.variantId)}
      </div>

      {/* 선택 시 배지 + 컨트롤 */}
      {selected && (
        <>
          <span className="absolute left-2 top-2 z-10 rounded-pill bg-primary px-2 py-0.5 text-xs font-medium text-white">
            {section.variantId}
            {section.fixed && " · 고정"}
          </span>
          {!section.fixed && (
            <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-pill bg-surface px-1 py-1 shadow">
              <IconBtn
                title="위로"
                disabled={!canUp}
                onClick={() => onMove(section.id, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </IconBtn>
              <IconBtn
                title="아래로"
                disabled={!canDown}
                onClick={() => onMove(section.id, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </IconBtn>
              <button
                type="button"
                title="드래그로 이동"
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab text-text-sub"
                {...sortable.attributes}
                {...sortable.listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <IconBtn
                title="삭제"
                onClick={() => onDelete(section.id)}
                danger
              >
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-pill",
        disabled
          ? "text-border"
          : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-text hover:bg-bg",
      )}
    >
      {children}
    </button>
  );
}
