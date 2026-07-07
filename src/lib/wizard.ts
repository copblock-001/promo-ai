import type { WizardData } from "@/store/wizard";

export const STEP_COUNT = 5;

/**
 * 각 단계에서 [다음] 활성 조건(SPEC 공통 규칙).
 * Step2·3·4의 실제 폼/검증은 이후 마일스톤(6·8)에서 채워지므로,
 * 폼이 아직 없는 단계는 임시로 통과시킨다.
 */
export function canProceedFrom(step: number, d: WizardData): boolean {
  switch (step) {
    case 1:
      return Boolean(
        d.name.trim() && d.brand_name.trim() && d.manager_name.trim(),
      );
    case 2:
      // TODO(m6): 목적 선택 폼 연결 시 → d.purpose_main && d.purpose_detail
      return true;
    case 3:
      // TODO(m6): 프로토타입 선택 폼 연결 시 → d.prototype_type
      return true;
    case 4:
      // TODO(m8): 최소 구성(GNB+KV) 검사
      return true;
    default:
      return true;
  }
}

export function stepPath(promotionId: string, step: number): string {
  return `/builder/${promotionId}/step-${step}`;
}
