"use client";

import { create } from "zustand";
import type {
  Layout,
  Promotion,
  PromotionStatus,
  PrototypeType,
  PurposeDetail,
  PurposeMain,
} from "@/types/promotion";

/** DB에 영속되는 위저드 데이터(promotions 컬럼과 대응) */
export interface WizardData {
  id: string | null;
  name: string;
  brand_name: string;
  manager_name: string;
  purpose_main: PurposeMain | null;
  purpose_detail: PurposeDetail | null;
  prototype_type: PrototypeType | null;
  current_step: number;
  status: PromotionStatus;
  layout: Layout;
}

interface WizardState extends WizardData {
  /** 마지막 저장 이후 변경 여부(autosave 트리거) */
  dirty: boolean;
  /** DB 값으로 1회 하이드레이트 완료 여부 */
  hydrated: boolean;

  hydrate: (promotion: Promotion) => void;
  /** 부분 변경(입력값). dirty=true 로 표시 → autosave 대상 */
  patch: (partial: Partial<WizardData>) => void;
  setCurrentStep: (step: number) => void;
  markSaved: () => void;
  reset: () => void;
}

const initial: WizardData = {
  id: null,
  name: "",
  brand_name: "",
  manager_name: "",
  purpose_main: null,
  purpose_detail: null,
  prototype_type: null,
  current_step: 1,
  status: "draft",
  layout: { sections: [] },
};

export const useWizard = create<WizardState>((set) => ({
  ...initial,
  dirty: false,
  hydrated: false,

  hydrate: (p) =>
    set({
      id: p.id,
      name: p.name ?? "",
      brand_name: p.brand_name ?? "",
      manager_name: p.manager_name ?? "",
      purpose_main: p.purpose_main,
      purpose_detail: p.purpose_detail,
      prototype_type: p.prototype_type,
      current_step: p.current_step ?? 1,
      status: p.status ?? "draft",
      layout: p.layout ?? { sections: [] },
      dirty: false,
      hydrated: true,
    }),

  patch: (partial) => set({ ...partial, dirty: true }),

  setCurrentStep: (step) => set({ current_step: step, dirty: true }),

  markSaved: () => set({ dirty: false }),

  reset: () => set({ ...initial, dirty: false, hydrated: false }),
}));

/** DB 저장 대상 필드만 추출 */
export function persistablePatch(state: WizardData) {
  return {
    name: state.name,
    brand_name: state.brand_name || null,
    manager_name: state.manager_name || null,
    purpose_main: state.purpose_main,
    purpose_detail: state.purpose_detail,
    prototype_type: state.prototype_type,
    current_step: state.current_step,
    status: state.status,
    layout: state.layout,
  };
}
