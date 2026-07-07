import { cn } from "@/lib/utils";
import type { PromotionStatus } from "@/types/promotion";

export type { PromotionStatus };

const STATUS_CONFIG: Record<
  PromotionStatus,
  { label: string; className: string }
> = {
  // 상태 배지 매핑 (SPEC 6장): 진행중=초록, 완료=보라, 초안=회색
  draft: { label: "초안", className: "bg-status-draft/15 text-status-draft" },
  in_progress: {
    label: "진행중",
    className: "bg-status-progress/15 text-status-progress",
  },
  done: { label: "완료", className: "bg-status-done/15 text-status-done" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: PromotionStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

/** 범용 배지 (예: 프리뷰의 KV 변형 라벨) */
export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill bg-primary px-2.5 py-0.5 text-xs font-medium text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}
