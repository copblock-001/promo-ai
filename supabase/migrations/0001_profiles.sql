-- ─────────────────────────────────────────────────────────────
-- Promo.ai · 0001_profiles
-- 인증(마일스톤 2)용 profiles 테이블 + 역할 enum + RLS.
-- (promotions 테이블/enum·Storage 정책은 "데이터 계층" 마일스톤에서 추가)
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에 붙여넣어 실행,
--            또는 Supabase CLI `supabase db push`.
--
-- 인증 모델 참고:
--   이메일이 없는 "아이디(닉네임) + 4자리 PIN" 방식이므로,
--   auth.users 에는 합성 이메일(u-<hash>@promo-ai.local)과
--   PIN에서 파생한 긴 비밀번호가 저장된다(서버 Route Handler에서 생성).
--   profiles.username 이 실제 로그인 아이디이며 고유하다.
-- ─────────────────────────────────────────────────────────────

-- 역할 enum (SPEC 5장)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('member', 'admin');
  end if;
end
$$;

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,                 -- 한글 실명 (예: 홍슬기)
  username    text not null unique,          -- 로그인 아이디(닉네임), 최대 15자
  role        public.user_role not null default 'member',
  avatar_url  text,
  created_at  timestamptz not null default now(),

  constraint profiles_name_len check (char_length(name) between 1 and 30),
  constraint profiles_username_len check (char_length(username) between 1 and 15),
  -- 아이디에는 공백 문자를 허용하지 않는다(한글/영문/숫자/특수문자만).
  constraint profiles_username_no_space check (username !~ '\s')
);

-- 이름 기반 조회(아이디/비밀번호 찾기)용 인덱스
create index if not exists profiles_name_idx on public.profiles (name);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- 회원가입·찾기·재설정 등 서버 작업은 service_role 로 수행되어 RLS를 우회한다.
-- 아래 정책은 클라이언트(anon, 로그인 세션) 접근을 본인 행으로 제한한다.
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 참고(TODO): admin 역할의 "타인 프로모션/프로필 전체 조회"(SPEC 부록 C)는
-- profiles 자기참조 정책이 RLS 재귀를 유발할 수 있어 여기서는 생략한다.
-- 운영 도구(DB Debug)는 서버에서 service_role 로 처리하거나,
-- SECURITY DEFINER 함수 기반 정책으로 별도 마일스톤에서 추가한다.
