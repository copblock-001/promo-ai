"use client";

/** 카드 그리드 컨테이너 — 로딩 스켈레톤 / 빈 상태 / 카드 렌더 (SPEC SCR-02) */
export function PromotionGrid({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyAction,
  children,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-card border border-border bg-surface"
          >
            <div className="aspect-[16/10] w-full animate-pulse bg-bg" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-bg" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-bg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border py-20 text-center">
        <p className="text-text-sub">{emptyTitle}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
