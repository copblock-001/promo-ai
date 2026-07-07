"use client";

import { useState } from "react";
import { ImageIcon, MoreHorizontal } from "lucide-react";
import type { Promotion } from "@/types/promotion";
import { StatusBadge } from "@/components/ui/badge";
import { PURPOSE_MAIN_LABEL } from "@/lib/labels";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

export function PromotionCard({
  promotion,
  mode,
  onOpen,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onRestore,
  busy = false,
}: {
  promotion: Promotion;
  mode: "active" | "archived";
  onOpen: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  busy?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const title = promotion.name?.trim() || "제목 없는 프로모션";
  const purpose = promotion.purpose_main
    ? PURPOSE_MAIN_LABEL[promotion.purpose_main]
    : null;
  const meta = [promotion.brand_name, promotion.manager_name, purpose]
    .filter(Boolean)
    .join(" · ");

  const items: MenuItem[] =
    mode === "archived"
      ? [
          { label: "복원", onClick: () => onRestore?.() },
          { label: "영구 삭제", onClick: onDelete, destructive: true },
        ]
      : [
          { label: "수정", onClick: () => onEdit?.() },
          { label: "복제", onClick: () => onDuplicate?.() },
          { label: "아카이브", onClick: () => onArchive?.() },
          { label: "삭제", onClick: onDelete, destructive: true },
        ];

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-shadow hover:shadow-md",
        busy && "pointer-events-none opacity-60",
      )}
    >
      {/* 썸네일 */}
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-bg text-left"
      >
        {promotion.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promotion.thumbnail_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          // TODO(asset): 썸네일 미생성 시 플레이스홀더
          <div className="flex h-full w-full items-center justify-center bg-primary-weak text-primary/50">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </button>

      {/* ⋯ 메뉴 */}
      <div className="absolute right-2 top-2">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="더보기"
          className="flex h-8 w-8 items-center justify-center rounded-pill bg-surface/90 text-text shadow-sm opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100 data-[open=true]:opacity-100"
          data-open={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-1 w-36 rounded-input border border-border bg-surface py-1 shadow-lg">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm hover:bg-bg",
                    item.destructive ? "text-red-600" : "text-text",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 본문 */}
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-col items-start gap-2 p-4 text-left"
      >
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{title}</h3>
          <StatusBadge status={promotion.status} />
        </div>
        <p className="truncate text-sm text-text-sub">{meta || "정보 없음"}</p>
        <p className="text-xs text-text-sub">
          {formatRelative(promotion.updated_at)} 수정
        </p>
      </button>
    </div>
  );
}
