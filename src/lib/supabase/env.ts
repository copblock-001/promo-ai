/**
 * Supabase 환경 변수 접근 헬퍼.
 * 값이 없으면 명확한 에러를 던져 설정 누락을 빠르게 알린다(SPEC 0.4).
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[Promo.ai] 환경 변수 ${name} 가 설정되지 않았습니다. .env.local 을 확인하세요 (SPEC 0.4 체크리스트).`,
    );
  }
  return value;
}

export const supabaseUrl = () =>
  required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabaseAnonKey = () =>
  required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

/** 서버 전용. 절대 클라이언트 번들에 포함되면 안 된다. */
export const supabaseServiceRoleKey = () =>
  required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
