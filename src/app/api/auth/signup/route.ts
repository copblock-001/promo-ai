import { NextResponse } from "next/server";
import {
  createServerSupabase,
  createServiceRoleSupabase,
} from "@/lib/supabase/server";
import {
  validateName,
  validatePin,
  validateUsername,
} from "@/lib/auth/validation";
import {
  derivePassword,
  normalizeUsername,
  usernameToEmail,
} from "@/lib/auth/credentials";

/** 회원가입: { name, username, pin } */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, username, pin } = body ?? {};

  const err =
    validateName(name) || validateUsername(username) || validatePin(pin);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const admin = createServiceRoleSupabase();
  const normUsername = normalizeUsername(username);
  const trimmedName = (name as string).trim();

  // 아이디 중복 확인
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", normUsername)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "이미 사용 중인 아이디입니다." },
      { status: 409 },
    );
  }

  const email = usernameToEmail(username);
  const password = derivePassword(username, pin);

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 합성 이메일이므로 확인 절차 생략
    user_metadata: { name: trimmedName, username: normUsername },
  });
  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  const { error: profErr } = await admin.from("profiles").insert({
    id: created.user.id,
    name: trimmedName,
    username: normUsername,
    role: "member",
  });
  if (profErr) {
    // 프로필 생성 실패 시 auth 사용자 롤백
    await admin.auth.admin.deleteUser(created.user.id);
    const duplicate = profErr.code === "23505";
    return NextResponse.json(
      {
        error: duplicate
          ? "이미 사용 중인 아이디입니다."
          : "회원가입에 실패했습니다.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }

  // 세션 쿠키 설정(자동 로그인)
  const supabase = await createServerSupabase();
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return NextResponse.json({ ok: true, signedIn: !signErr });
}
