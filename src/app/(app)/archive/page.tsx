import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ArchiveView } from "@/components/app/ArchiveView";
import type { ShellProfile } from "@/components/app/AppShell";

/** SCR-08 · 아카이브 */
export default async function ArchivePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .maybeSingle();

  const shellProfile: ShellProfile = {
    name: profile?.name ?? "회원",
    role: profile?.role === "admin" ? "admin" : "member",
  };

  return <ArchiveView profile={shellProfile} />;
}
