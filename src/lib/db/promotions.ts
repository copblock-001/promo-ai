import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewPromotionInput,
  Promotion,
  PromotionUpdate,
} from "@/types/promotion";

/**
 * promotions CRUD 데이터 접근 계층.
 * SupabaseClient를 인자로 받아 서버(server.ts)·클라이언트(client.ts) 양쪽에서 재사용.
 * 모든 접근은 RLS(owner_id = auth.uid())로 행 단위 보호된다.
 */

const TABLE = "promotions";

export type SortKey = "recent" | "oldest" | "name";

export interface ListPromotionsOptions {
  /** name/brand_name/manager_name 텍스트 검색(ilike) */
  search?: string;
  sort?: SortKey;
  /** 아카이브 여부 (기본 false = 활성 목록) */
  archived?: boolean;
}

export async function fetchPromotions(
  supabase: SupabaseClient,
  options: ListPromotionsOptions = {},
): Promise<Promotion[]> {
  const { search, sort = "recent", archived = false } = options;

  let query = supabase.from(TABLE).select("*").eq("archived", archived);

  const term = search?.trim();
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      `name.ilike.${like},brand_name.ilike.${like},manager_name.ilike.${like}`,
    );
  }

  if (sort === "name") {
    query = query.order("name", { ascending: true });
  } else {
    query = query.order("updated_at", { ascending: sort === "oldest" });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Promotion[];
}

export async function fetchPromotion(
  supabase: SupabaseClient,
  id: string,
): Promise<Promotion | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Promotion | null) ?? null;
}

async function requireUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user.id;
}

/** 새 프로모션 생성 (status=draft, step=1, 빈 layout) */
export async function createPromotion(
  supabase: SupabaseClient,
  input: NewPromotionInput,
): Promise<Promotion> {
  const ownerId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      owner_id: ownerId,
      name: input.name ?? "",
      brand_name: input.brand_name || null,
      manager_name: input.manager_name || null,
      status: "draft",
      current_step: 1,
      layout: { sections: [] },
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Promotion;
}

export async function updatePromotion(
  supabase: SupabaseClient,
  id: string,
  patch: PromotionUpdate,
): Promise<Promotion> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Promotion;
}

/** 아카이브/복원 (soft delete) */
export async function setArchived(
  supabase: SupabaseClient,
  id: string,
  archived: boolean,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ archived })
    .eq("id", id);
  if (error) throw error;
}

/** 영구 삭제 */
export async function deletePromotion(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

/** 복제 (콘텐츠 유지, 새 draft로) */
export async function duplicatePromotion(
  supabase: SupabaseClient,
  id: string,
): Promise<Promotion> {
  const source = await fetchPromotion(supabase, id);
  if (!source) throw new Error("복제할 프로모션을 찾을 수 없습니다.");
  const ownerId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      owner_id: ownerId,
      name: `${source.name} (복사본)`,
      brand_name: source.brand_name,
      manager_name: source.manager_name,
      purpose_main: source.purpose_main,
      purpose_detail: source.purpose_detail,
      prototype_type: source.prototype_type,
      status: "draft",
      current_step: source.current_step,
      layout: source.layout,
      archived: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Promotion;
}
