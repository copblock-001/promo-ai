import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { WizardShell } from "@/components/builder/WizardShell";
import type { Promotion } from "@/types/promotion";

/**
 * 빌더 공통 레이아웃 — 프로모션 로드(소유권 RLS) + 위저드 셸.
 * 단계 간 이동에서는 이 레이아웃이 유지되어 스토어/셸 상태가 보존된다.
 */
export default async function BuilderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <WizardShell
      promotion={promotion as Promotion}
      profileName={profile?.name ?? "회원"}
    >
      {children}
    </WizardShell>
  );
}
