import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { derivePassword, usernameToEmail } from "@/lib/auth/credentials";

/** 로그인: { username, pin } */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { username, pin } = body ?? {};

  if (typeof username !== "string" || typeof pin !== "string" || !username || !pin) {
    return NextResponse.json(
      { error: "아이디와 비밀번호를 입력해주세요." },
      { status: 400 },
    );
  }

  const email = usernameToEmail(username);
  const password = derivePassword(username, pin);

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true });
}
