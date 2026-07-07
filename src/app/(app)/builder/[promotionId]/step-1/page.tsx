import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { Stepper } from "@/components/ui/stepper";

/**
 * 위저드 Step1 자리표시자 — 대시보드의 "새 프로모션/수정" 흐름이 404 나지 않도록
 * 최소 페이지만 둔다. 실제 위저드(SCR-03~07)는 마일스톤 5~6에서 구현.
 */
export default async function BuilderStep1Placeholder({
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
    .select("id, name")
    .eq("id", params.promotionId)
    .maybeSingle();

  if (!promotion) redirect("/dashboard");

  const title = promotion.name?.trim() || "제목 없는 프로모션";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-10">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-text-sub hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        대시보드로
      </Link>

      <Stepper current={1} />

      <section className="flex flex-col gap-3 rounded-card border border-dashed border-border bg-surface p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-text-sub">
          프로모션이 생성되었습니다(초안). 5단계 생성 위저드(정보 입력 → 목적
          선택 → 프로토타입 선택 → 컴포넌트 수정 → 콘텐츠 입력)는 다음
          마일스톤에서 구현됩니다.
        </p>
        <p className="text-xs text-text-sub">promotion id: {promotion.id}</p>
      </section>
    </main>
  );
}
