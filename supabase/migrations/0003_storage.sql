-- ─────────────────────────────────────────────────────────────
-- Promo.ai · 0003_storage
-- Storage 버킷(assets, thumbnails, exports) + 정책.
--
-- 정책 요지:
--  - 읽기: 공개(카드 썸네일·프리뷰 이미지·HTML export 링크 표시용)
--  - 쓰기/수정/삭제: 로그인 사용자가 "본인 폴더"(경로 첫 세그먼트 = auth.uid())에만
--
-- 업로드 시 파일 경로는 반드시 `<auth.uid()>/...` 형태여야 한다(lib/storage.ts 참고).
--
-- 적용: Supabase Dashboard → SQL Editor 에 붙여넣어 실행.
-- (버킷은 Dashboard → Storage 에서 수동 생성해도 되며, 이 SQL이 자동 생성한다)
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values
  ('assets', 'assets', true),
  ('thumbnails', 'thumbnails', true),
  ('exports', 'exports', true)
on conflict (id) do nothing;

-- 공개 읽기
drop policy if exists "promo_public_read" on storage.objects;
create policy "promo_public_read" on storage.objects
  for select
  using (bucket_id in ('assets', 'thumbnails', 'exports'));

-- 업로드(본인 폴더)
drop policy if exists "promo_owner_insert" on storage.objects;
create policy "promo_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('assets', 'thumbnails', 'exports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 수정(본인 폴더)
drop policy if exists "promo_owner_update" on storage.objects;
create policy "promo_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('assets', 'thumbnails', 'exports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 삭제(본인 폴더)
drop policy if exists "promo_owner_delete" on storage.objects;
create policy "promo_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('assets', 'thumbnails', 'exports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
