import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** 위저드 5단계 (SPEC 공통 규칙 · Part 3) */
export const WIZARD_STEPS = [
  "프로모션 정보 입력",
  "프로모션 목적 선택",
  "프로토타입 선택",
  "컴포넌트 수정",
  "콘텐츠 입력",
] as const;

export interface StepperProps {
  /** 현재 단계 (1~5) */
  current: number;
  className?: string;
}

export function Stepper({ current, className }: StepperProps) {
  return (
    <nav
      aria-label="위저드 진행 단계"
      className={cn("flex items-center gap-1", className)}
    >
      {WIZARD_STEPS.map((label, index) => {
        const step = index + 1;
        const isCurrent = step === current;
        const isDone = step < current;
        const isActive = isCurrent || isDone; // 현재·완료 = 보라, 미래 = 회색
        return (
          <div key={label} className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill text-xs font-semibold",
                  isActive
                    ? "bg-primary text-white"
                    : "bg-bg text-text-sub ring-1 ring-border",
                )}
              >
                {step}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm",
                  isActive ? "font-medium text-text" : "text-text-sub",
                )}
              >
                {label}
              </span>
            </div>
            {step < WIZARD_STEPS.length && (
              <ChevronRight
                className="h-4 w-4 text-text-sub"
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
