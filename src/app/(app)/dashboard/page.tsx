import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * 대시보드 — 마일스톤 2 단계의 최소 플레이스홀더.
 * 로그인/라우트 보호/프로필 조회가 동작함을 확인하는 용도.
 * 실제 카드 그리드·검색·정렬(SCR-02)은 "대시보드" 마일스톤에서 구현.
 */
export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미들웨어가 1차 보호하지만, 서버에서도 방어적으로 확인
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, username, role")
    .eq("id", user.id)
    .maybeSingle();

  const roleLabel = profile?.role === "admin" ? "관리자" : "멤버";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        {/* TODO(asset): 로고 에셋 교체 */}
        <div className="flex items-center gap-2 text-xl font-bold text-primary">
          <Sparkles className="h-5 w-5" />
          Promo.ai
        </div>
        <LogoutButton />
      </header>

      <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6">
        <h1 className="text-2xl font-bold">
          {profile?.name ?? "회원"}님, 환영합니다 :)
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-sub">
          <span>
            아이디:{" "}
            <span className="font-mono font-medium text-text">
              {profile?.username ?? "-"}
            </span>
          </span>
          <span aria-hidden>·</span>
          <span>역할: {roleLabel}</span>
        </div>
        <p className="mt-2 text-sm text-text-sub">
          로그인·라우트 보호·프로필 조회가 정상 동작합니다. 대시보드(SCR-02)
          본화면은 다음 마일스톤에서 구현됩니다.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-text-sub">상태 배지 미리보기:</span>
          <StatusBadge status="draft" />
          <StatusBadge status="in_progress" />
          <StatusBadge status="done" />
        </div>
      </section>
    </main>
  );
}
