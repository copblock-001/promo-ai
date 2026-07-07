/**
 * 데이터 모델 타입 (SPEC 5장).
 * DB enum/컬럼과 1:1 대응. 레이아웃은 promotions.layout(JSONB) 구조.
 */

export type UserRole = "member" | "admin";
export type PurposeMain = "revenue" | "engagement";
export type PurposeDetail = "repurchase" | "new_product" | "discount" | "collab";
export type PrototypeType = "event" | "price" | "product";
export type PromotionStatus = "draft" | "in_progress" | "done";
export type Zone = "top" | "middle" | "bottom";

/** layout.sections[] 항목 (SPEC 5장 JSONB 구조) */
export interface Section {
  id: string;
  zone: Zone;
  fixed: boolean;
  componentType: string;
  variantId: string;
  order: number;
  /** 컴포넌트 필드 스키마에 따른 값(부록 A) — 마일스톤별로 구체화 */
  content: Record<string, unknown>;
}

export interface Layout {
  sections: Section[];
}

export interface Profile {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  owner_id: string;
  name: string;
  brand_name: string | null;
  manager_name: string | null;
  purpose_main: PurposeMain | null;
  purpose_detail: PurposeDetail | null;
  prototype_type: PrototypeType | null;
  status: PromotionStatus;
  current_step: number;
  layout: Layout;
  thumbnail_url: string | null;
  export_html_url: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

/** 새 프로모션 생성 입력(Step1 최소 필드) */
export interface NewPromotionInput {
  name: string;
  brand_name: string;
  manager_name: string;
}

/** 부분 수정 패치 (id/owner/타임스탬프 제외) */
export type PromotionUpdate = Partial<
  Omit<Promotion, "id" | "owner_id" | "created_at" | "updated_at">
>;
