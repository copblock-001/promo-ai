import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/** /builder/[id] → 마지막 작업 단계로 복귀 (SPEC: current_step) */
export default async function BuilderIndex({
  params,
}: {
  params: { promotionId: string };
}) {
  const supabase = await createServerSupabase();
  const { data: promotion } = await supabase
    .from("promotions")
    .select("current_step")
    .eq("id", params.promotionId)
    .maybeSingle();

  const step = promotion?.current_step ?? 1;
  redirect(`/builder/${params.promotionId}/step-${step}`);
}
