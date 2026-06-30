import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * 서버 컴포넌트 / Route Handler용 Supabase 클라이언트.
 * 쿠키 기반 세션을 사용해 RLS가 적용된다(owner_id = auth.uid()).
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component에서 호출되면 set이 무시될 수 있다.
          // 미들웨어에서 세션 갱신을 처리하므로 안전하게 무시한다.
        }
      },
    },
  });
}

/**
 * 서비스 롤 클라이언트 — RLS를 우회한다.
 * Route Handler 등 서버 환경에서만, 권한 검증을 거친 후에만 사용할 것.
 */
export function createServiceRoleSupabase() {
  return createServerClient(supabaseUrl(), supabaseServiceRoleKey(), {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // 서비스 롤 클라이언트는 세션 쿠키를 사용하지 않는다.
      },
    },
  });
}
