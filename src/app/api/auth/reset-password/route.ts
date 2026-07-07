import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { validatePin } from "@/lib/auth/validation";
import { derivePassword, verifyResetToken } from "@/lib/auth/credentials";

/**
 * 비밀번호(4자리 PIN) 재설정: { resetToken, newPin }
 * resetToken 은 /api/auth/lookup 결과로 발급된 서명·단기 토큰.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { resetToken, newPin } = body ?? {};

  const pinErr = validatePin(newPin);
  if (pinErr) return NextResponse.json({ error: pinErr }, { status: 400 });

  const profileId =
    typeof resetToken === "string" ? verifyResetToken(resetToken) : null;
  if (!profileId) {
    return NextResponse.json(
      { error: "재설정 요청이 만료되었거나 올바르지 않습니다. 다시 시도해주세요." },
      { status: 400 },
    );
  }

  const admin = createServiceRoleSupabase();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, username")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      { error: "계정을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const password = derivePassword(profile.username as string, newPin);
  const { error } = await admin.auth.admin.updateUserById(profile.id as string, {
    password,
  });
  if (error) {
    return NextResponse.json(
      { error: "비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
