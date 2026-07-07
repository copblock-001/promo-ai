import type { Zone } from "@/types/promotion";

/**
 * 컴포넌트 카탈로그 & 필드 스키마 (SPEC 부록 A).
 * 변형은 타입당 1~2개부터 시작. 각 변형은 동일 필드 스키마를 공유(콘텐츠 호환).
 */

export type FieldType = "text" | "textarea" | "image" | "date" | "list";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface VariantDef {
  id: string; // 예: "KV#t3"
  label: string;
}

export interface ComponentDef {
  type: string; // componentType 키
  label: string; // 한국어 표시명
  zone: Zone;
  fixed: boolean;
  variants: VariantDef[];
  fields: FieldDef[];
  defaultContent: Record<string, unknown>;
}

export const CATALOG: Record<string, ComponentDef> = {
  GNB_LNB: {
    type: "GNB_LNB",
    label: "GNB / LNB",
    zone: "top",
    fixed: true,
    variants: [
      { id: "GNB#01", label: "기본 헤더" },
      { id: "GNB#02", label: "센터 로고" },
    ],
    fields: [
      { key: "logo", label: "로고 텍스트", type: "text", placeholder: "브랜드" },
      { key: "menu", label: "메뉴 항목", type: "list", placeholder: "메뉴명" },
    ],
    defaultContent: {
      logo: "BRAND",
      menu: ["이벤트", "제품", "혜택", "고객센터"],
    },
  },

  KV: {
    type: "KV",
    label: "KV (키비주얼)",
    zone: "top",
    fixed: true,
    variants: [
      { id: "KV#t1", label: "좌측 텍스트" },
      { id: "KV#t3", label: "중앙 정렬" },
    ],
    fields: [
      { key: "label", label: "라벨", type: "text", placeholder: "EVENT" },
      { key: "headline", label: "헤드라인", type: "text", placeholder: "텍스트를 입력해주세요." },
      { key: "description", label: "설명", type: "textarea", placeholder: "텍스트를 입력해주세요." },
      { key: "textButton", label: "텍스트 버튼", type: "text", placeholder: "버튼명을 입력해주세요." },
      { key: "solidButton", label: "솔리드 버튼", type: "text", placeholder: "버튼명을 입력해주세요." },
      { key: "image", label: "이미지", type: "image" },
      { key: "validFrom", label: "시작일", type: "date" },
      { key: "validTo", label: "종료일", type: "date" },
    ],
    defaultContent: {
      label: "SUMMER EVENT",
      headline: "여름 시즌 특별 프로모션",
      description: "지금 참여하고 특별한 혜택을 받아보세요.",
      textButton: "자세히 보기",
      solidButton: "지금 참여하기",
      image: "",
      validFrom: "",
      validTo: "",
    },
  },

  ContentsCard: {
    type: "ContentsCard",
    label: "콘텐츠 카드",
    zone: "middle",
    fixed: false,
    variants: [
      { id: "CC#01", label: "이미지 상단" },
      { id: "CC#02", label: "이미지 좌측" },
    ],
    fields: [
      { key: "title", label: "제목", type: "text", placeholder: "제목을 입력해주세요." },
      { key: "description", label: "설명", type: "textarea", placeholder: "설명을 입력해주세요." },
      { key: "image", label: "이미지", type: "image" },
      { key: "link", label: "링크", type: "text", placeholder: "https://" },
    ],
    defaultContent: {
      title: "이벤트 참여 방법",
      description: "간단한 3단계로 이벤트에 참여하세요.",
      image: "",
      link: "",
    },
  },

  ProductCard: {
    type: "ProductCard",
    label: "제품 카드",
    zone: "middle",
    fixed: false,
    variants: [
      { id: "PC#01", label: "세로형" },
      { id: "PC#02", label: "가로형" },
    ],
    fields: [
      { key: "productName", label: "제품명", type: "text", placeholder: "제품명" },
      { key: "description", label: "설명", type: "textarea", placeholder: "제품 설명" },
      { key: "price", label: "가격", type: "text", placeholder: "0" },
      { key: "image", label: "이미지", type: "image" },
      { key: "badge", label: "배지", type: "text", placeholder: "BEST" },
    ],
    defaultContent: {
      productName: "대표 상품",
      description: "핵심 특징을 한 줄로 소개합니다.",
      price: "29,000",
      image: "",
      badge: "BEST",
    },
  },

  KVTabContainer: {
    type: "KVTabContainer",
    label: "탭 컨테이너",
    zone: "middle",
    fixed: false,
    variants: [{ id: "TAB#01", label: "기본 탭" }],
    fields: [
      { key: "tabs", label: "탭 목록", type: "list", placeholder: "탭명" },
      { key: "description", label: "설명", type: "textarea", placeholder: "탭 설명" },
    ],
    defaultContent: {
      tabs: ["이벤트 안내", "참여 방법", "유의사항"],
      description: "탭을 선택해 자세한 내용을 확인하세요.",
    },
  },

  Video: {
    type: "Video",
    label: "비디오",
    zone: "middle",
    fixed: false,
    variants: [{ id: "VID#01", label: "기본" }],
    fields: [
      { key: "videoUrl", label: "비디오 URL", type: "text", placeholder: "https://" },
      { key: "poster", label: "포스터 이미지", type: "image" },
    ],
    defaultContent: {
      videoUrl: "",
      poster: "",
    },
  },

  RTB: {
    type: "RTB",
    label: "RTB (구매이유)",
    zone: "middle",
    fixed: false,
    variants: [{ id: "RTB#01", label: "3단 아이콘" }],
    fields: [
      { key: "title", label: "제목", type: "text", placeholder: "왜 선택해야 할까요?" },
      { key: "items", label: "이유 목록", type: "list", placeholder: "이유" },
    ],
    defaultContent: {
      title: "왜 선택해야 할까요?",
      items: ["검증된 품질", "합리적인 가격", "빠른 배송"],
    },
  },

  FAQ: {
    type: "FAQ",
    label: "FAQ",
    zone: "bottom",
    fixed: false,
    variants: [{ id: "FAQ#01", label: "아코디언" }],
    fields: [
      {
        key: "items",
        label: "질문/답변 (질문 :: 답변)",
        type: "list",
        placeholder: "질문 :: 답변",
      },
    ],
    defaultContent: {
      items: [
        "이벤트 기간은 언제인가요? :: 프로모션 페이지에 표기된 기간 동안 진행됩니다.",
        "참여 자격이 있나요? :: 누구나 참여 가능합니다.",
      ],
    },
  },

  Disclaimer: {
    type: "Disclaimer",
    label: "유의사항",
    zone: "bottom",
    fixed: false,
    variants: [{ id: "DISC#01", label: "기본" }],
    fields: [
      { key: "text", label: "본문", type: "textarea", placeholder: "유의사항을 입력해주세요." },
      { key: "notice", label: "고지", type: "text", placeholder: "고지 문구" },
    ],
    defaultContent: {
      text: "본 프로모션은 당사 사정에 따라 사전 고지 없이 변경/종료될 수 있습니다.",
      notice: "© BRAND. All rights reserved.",
    },
  },
};

export const ZONES: { zone: Zone; label: string; note: string }[] = [
  { zone: "top", label: "Top", note: "고정" },
  { zone: "middle", label: "Middle", note: "조절 가능" },
  { zone: "bottom", label: "Bottom", note: "조절 가능" },
];

export function componentsByZone(zone: Zone): ComponentDef[] {
  return Object.values(CATALOG).filter((c) => c.zone === zone);
}

export function getComponentDef(type: string): ComponentDef | undefined {
  return CATALOG[type];
}
