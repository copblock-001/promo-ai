"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
 * 익명 키만 사용한다.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}

/** 브라우저 클라이언트 싱글턴 (GoTrue 중복 인스턴스 방지) */
let browserSingleton: ReturnType<typeof createClient> | null = null;
export function getBrowserSupabase() {
  return (browserSingleton ??= createClient());
}
