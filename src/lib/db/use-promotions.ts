"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { NewPromotionInput, PromotionUpdate } from "@/types/promotion";
import {
  createPromotion,
  deletePromotion,
  duplicatePromotion,
  fetchPromotion,
  fetchPromotions,
  setArchived,
  updatePromotion,
  type ListPromotionsOptions,
} from "./promotions";

/** 브라우저 Supabase 클라이언트 싱글턴 (GoTrue 중복 인스턴스 방지) */
let browserClient: ReturnType<typeof createClient> | null = null;
function sb() {
  return (browserClient ??= createClient());
}

export const promotionKeys = {
  all: ["promotions"] as const,
  list: (options: ListPromotionsOptions) =>
    ["promotions", "list", options] as const,
  detail: (id: string) => ["promotions", "detail", id] as const,
};

export function usePromotions(options: ListPromotionsOptions = {}) {
  return useQuery({
    queryKey: promotionKeys.list(options),
    queryFn: () => fetchPromotions(sb(), options),
  });
}

export function usePromotion(id: string) {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => fetchPromotion(sb(), id),
    enabled: Boolean(id),
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewPromotionInput) => createPromotion(sb(), input),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.all }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PromotionUpdate }) =>
      updatePromotion(sb(), id, patch),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: promotionKeys.all });
      qc.setQueryData(promotionKeys.detail(updated.id), updated);
    },
  });
}

export function useSetArchived() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      setArchived(sb(), id, archived),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.all }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromotion(sb(), id),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.all }),
  });
}

export function useDuplicatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicatePromotion(sb(), id),
    onSuccess: () => qc.invalidateQueries({ queryKey: promotionKeys.all }),
  });
}
