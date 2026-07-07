import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage 헬퍼 (SPEC 부록 B / 마일스톤 3).
 * 버킷: assets(업로드 이미지) · thumbnails(카드 썸네일) · exports(HTML).
 *
 * ⚠️ RLS 정책(0003_storage.sql)상 파일 경로의 첫 세그먼트는 반드시
 *    업로더의 auth.uid() 여야 쓰기가 허용된다 → `${userId}/...`
 */

export const BUCKETS = {
  assets: "assets",
  thumbnails: "thumbnails",
  exports: "exports",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface UploadOptions {
  /** 명시하지 않으면 `${userId}/<uuid>-<원본명>` 사용 */
  path?: string;
  contentType?: string;
  upsert?: boolean;
}

export async function uploadToBucket(
  supabase: SupabaseClient,
  bucket: BucketName,
  userId: string,
  file: File | Blob,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const fileName = file instanceof File ? file.name : "file";
  const path = options.path ?? `${userId}/${crypto.randomUUID()}-${fileName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: options.contentType,
    upsert: options.upsert ?? false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function removeFromBucket(
  supabase: SupabaseClient,
  bucket: BucketName,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
