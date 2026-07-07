import { NextResponse } from "next/server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { maskUsername } from "@/lib/auth/validation";
import { normalizeUsername, signResetToken } from "@/lib/auth/credentials";

/**
 * 계정 조회 (아이디 찾기 / 비밀번호 찾기 공용).
 * 입력: { by: "name" | "username", value }
 * 출력: { accounts: [{ maskedUsername, resetToken }] }
 *  - by:"name"     → 아이디 찾기 (동명이인 시 복수)
 *  - by:"username" → 비밀번호 찾기(아이디로)
 * 결과의 resetToken 으로 /api/auth/reset-password 진행.
 *
 * ⚠️ 강한 신원확인(OTP 등)이 없는 저강도 흐름 — SPEC 요구사항 반영. // TODO(security)
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const by = body?.by;
  const value = body?.value;

  if ((by !== "name" && by !== "username") || typeof value !== "string" || !value.trim()) {
    return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });
  }

  const admin = createServiceRoleSupabase();
  const column = by === "name" ? "name" : "username";
  const query = by === "name" ? value.trim() : normalizeUsername(value.trim());

  const { data, error } = await admin
    .from("profiles")
    .select("id, username")
    .eq(column, query)
    .limit(10);

  if (error) {
    return NextResponse.json(
      { error: "조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          by === "name"
            ? "일치하는 계정을 찾을 수 없습니다."
            : "일치하는 아이디를 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }

  const accounts = data.map((row) => ({
    maskedUsername: maskUsername(row.username as string),
    resetToken: signResetToken(row.id as string),
  }));

  return NextResponse.json({ accounts });
}
