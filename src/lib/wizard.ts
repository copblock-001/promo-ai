import type { WizardData } from "@/store/wizard";
import { hasMinimum } from "@/lib/layout";

export const STEP_COUNT = 5;

/** 각 단계에서 [다음] 활성 조건 (SPEC 공통 규칙). */
export function canProceedFrom(step: number, d: WizardData): boolean {
  switch (step) {
    case 1:
      return Boolean(
        d.name.trim() && d.brand_name.trim() && d.manager_name.trim(),
      );
    case 2:
      return d.purpose_main !== null && d.purpose_detail !== null;
    case 3:
      return d.prototype_type !== null;
    case 4:
      return hasMinimum(d.layout); // 최소 구성(GNB + KV)
    default:
      return true;
  }
}

export function stepPath(promotionId: string, step: number): string {
  return `/builder/${promotionId}/step-${step}`;
}
