import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  createServerSupabase,
  createServiceRoleSupabase,
} from "@/lib/supabase/server";
import { StatusBadge, type PromotionStatus } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";

/**
 * DB Debug — 관리자 전용 운영 도구 (SPEC 부록 C).
 * 단순 데이터 점검 뷰. 서비스 롤로 전체 데이터를 조회한다.
 * TODO(admin): 시드/리셋 등 확장 기능은 필요 시 추가.
 */
export default async function DbDebugPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createServiceRoleSupabase();
  const { count: promoCount } = await admin
    .from("promotions")
    .select("*", { count: "exact", head: true });
  const { count: profileCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { data: recent } = await admin
    .from("promotions")
    .select("id, name, status, owner_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-text-sub hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" /> 대시보드로
      </Link>

      <h1 className="text-2xl font-bold">DB Debug</h1>

      <div className="flex gap-4">
        <Stat label="프로모션" value={promoCount ?? 0} />
        <Stat label="프로필" value={profileCount ?? 0} />
      </div>

      <section className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-text-sub">
            <tr>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">owner_id</th>
              <th className="px-4 py-3 font-medium">수정</th>
            </tr>
          </thead>
          <tbody>
            {(recent ?? []).map((r) => (
              <tr key={r.id as string} className="border-b border-border">
                <td className="px-4 py-3">
                  {(r.name as string)?.trim() || "제목 없음"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status as PromotionStatus} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-sub">
                  {(r.owner_id as string).slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-text-sub">
                  {formatRelative(r.updated_at as string)}
                </td>
              </tr>
            ))}
            {(!recent || recent.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-sub">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-card border border-border bg-surface p-5">
      <p className="text-sm text-text-sub">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value.toLocaleString("ko-KR")}</p>
    </div>
  );
}
