import type {
  PurposeDetail,
  PurposeMain,
  PrototypeType,
} from "@/types/promotion";
import type { SortKey } from "@/lib/db/promotions";

/** enum → 한국어 라벨 (SPEC Part 2) */
export const PURPOSE_MAIN_LABEL: Record<PurposeMain, string> = {
  revenue: "매출증진",
  engagement: "고객 참여",
};

export const PURPOSE_DETAIL_LABEL: Record<PurposeDetail, string> = {
  repurchase: "재구매 / 구독유도",
  new_product: "신제품 홍보",
  discount: "할인 프로모션",
  collab: "제휴 / 콜라보레이션",
};

export const PROTOTYPE_LABEL: Record<PrototypeType, string> = {
  event: "이벤트 강조",
  price: "가격 강조",
  product: "제품 강조",
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "name", label: "이름순" },
];
