import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/** 로그아웃 */
export async function POST() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
