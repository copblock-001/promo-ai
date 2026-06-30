import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** 인라인 에러 메시지 (한국어) — SPEC 공통 규칙 */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-12 w-full rounded-input border bg-surface px-4 text-sm text-text",
          "placeholder:text-text-sub",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          error ? "border-red-500 focus-visible:ring-red-500" : "border-border",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
