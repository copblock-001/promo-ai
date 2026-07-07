import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getLLMProvider } from "@/lib/ai";
import { getComponentDef } from "@/lib/components/catalog";
import type { Layout } from "@/types/promotion";

/**
 * AI로 채우기 (SPEC 부록 B-1).
 * 입력: { promotionId, sectionId }
 * 서버가 promotion을 RLS로 로드해 컨텍스트를 구성 → 선택 섹션의 텍스트 필드 카피 생성.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { promotionId, sectionId } = body ?? {};
  if (!promotionId || !sectionId) {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: promo } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", promotionId)
    .maybeSingle();
  if (!promo) {
    return NextResponse.json(
      { error: "프로모션을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const layout = promo.layout as Layout;
  const section = layout.sections?.find((s) => s.id === sectionId);
  if (!section) {
    return NextResponse.json(
      { error: "섹션을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const def = getComponentDef(section.componentType);
  const fields =
    def?.fields
      .filter((f) => f.type === "text" || f.type === "textarea")
      .map((f) => f.key) ?? [];
  if (fields.length === 0) {
    return NextResponse.json({ copy: {} });
  }

  try {
    const provider = getLLMProvider();
    const copy = await provider.generateCopy({
      name: promo.name ?? "",
      brandName: promo.brand_name ?? "",
      purposeMain: promo.purpose_main ?? "revenue",
      purposeDetail: promo.purpose_detail ?? "discount",
      prototypeType: promo.prototype_type ?? "event",
      componentType: section.componentType,
      variantId: section.variantId,
      fields,
    });
    return NextResponse.json({ copy });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "AI 생성에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
