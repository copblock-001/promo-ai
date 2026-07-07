-- ─────────────────────────────────────────────────────────────
-- Promo.ai · 0002_promotions
-- 데이터 계층(마일스톤 3): promotions 테이블 + enum + RLS + updated_at 트리거.
-- 선행: 0001_profiles (profiles 테이블) 적용 필요.
--
-- 적용: Supabase Dashboard → SQL Editor 에 붙여넣어 실행,
--       또는 Supabase CLI `supabase db push`.
-- ─────────────────────────────────────────────────────────────

-- uuid 생성 함수(gen_random_uuid) 보장
create extension if not exists pgcrypto;

-- enum 타입 (SPEC 5장)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'purpose_main') then
    create type public.purpose_main as enum ('revenue', 'engagement');
  end if;
  if not exists (select 1 from pg_type where typname = 'purpose_detail') then
    create type public.purpose_detail as enum ('repurchase', 'new_product', 'discount', 'collab');
  end if;
  if not exists (select 1 from pg_type where typname = 'prototype_type') then
    create type public.prototype_type as enum ('event', 'price', 'product');
  end if;
  if not exists (select 1 from pg_type where typname = 'promotion_status') then
    create type public.promotion_status as enum ('draft', 'in_progress', 'done');
  end if;
end
$$;

create table if not exists public.promotions (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles (id) on delete cascade,
  name            text not null default '',            -- Step1
  brand_name      text,                                 -- Step1
  manager_name    text,                                 -- Step1
  purpose_main    public.purpose_main,                  -- Step2
  purpose_detail  public.purpose_detail,                -- Step2
  prototype_type  public.prototype_type,                -- Step3
  status          public.promotion_status not null default 'draft',
  current_step    int not null default 1 check (current_step between 1 and 5),
  layout          jsonb not null default '{"sections": []}'::jsonb,
  thumbnail_url   text,
  export_html_url text,
  archived        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists promotions_owner_idx on public.promotions (owner_id);
create index if not exists promotions_owner_archived_idx on public.promotions (owner_id, archived);
create index if not exists promotions_updated_idx on public.promotions (updated_at desc);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists promotions_set_updated_at on public.promotions;
create trigger promotions_set_updated_at
  before update on public.promotions
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- RLS: 행 단위 소유권 (owner_id = auth.uid())
-- ─────────────────────────────────────────────────────────────
alter table public.promotions enable row level security;

drop policy if exists "promotions_select_own" on public.promotions;
create policy "promotions_select_own" on public.promotions
  for select using (auth.uid() = owner_id);

drop policy if exists "promotions_insert_own" on public.promotions;
create policy "promotions_insert_own" on public.promotions
  for insert with check (auth.uid() = owner_id);

drop policy if exists "promotions_update_own" on public.promotions;
create policy "promotions_update_own" on public.promotions
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "promotions_delete_own" on public.promotions;
create policy "promotions_delete_own" on public.promotions
  for delete using (auth.uid() = owner_id);
