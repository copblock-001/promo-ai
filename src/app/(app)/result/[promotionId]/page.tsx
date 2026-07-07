import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ResultView } from "@/components/result/ResultView";
import type { Promotion } from "@/types/promotion";

/** 결과물 페이지 — 프리뷰 + PNG/HTML export (SPEC 부록 B-2) */
export default async function ResultPage({
  params,
}: {
  params: { promotionId: string };
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: promotion } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", params.promotionId)
    .maybeSingle();
  if (!promotion) redirect("/dashboard");

  return <ResultView promotion={promotion as Promotion} />;
}
