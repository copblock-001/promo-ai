"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type ShellProfile } from "@/components/app/AppShell";
import { PromotionCard } from "@/components/app/PromotionCard";
import { PromotionGrid } from "@/components/app/PromotionGrid";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useDeletePromotion,
  usePromotions,
  useSetArchived,
} from "@/lib/db/use-promotions";

export function ArchiveView({ profile }: { profile: ShellProfile }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: promotions, isLoading } = usePromotions({
    search,
    sort: "recent",
    archived: true,
  });
  const restoreMut = useSetArchived();
  const deleteMut = useDeletePromotion();

  return (
    <AppShell
      active="archive"
      profile={profile}
      search={search}
      onSearchChange={setSearch}
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">아카이브</h1>

        <PromotionGrid
          isLoading={isLoading}
          isEmpty={!promotions || promotions.length === 0}
          emptyTitle={
            search ? "검색 결과가 없습니다." : "보관된 프로모션이 없습니다."
          }
        >
          {promotions?.map((p) => (
            <PromotionCard
              key={p.id}
              promotion={p}
              mode="archived"
              onOpen={() => router.push(`/builder/${p.id}/step-1`)}
              onRestore={() =>
                restoreMut.mutate({ id: p.id, archived: false })
              }
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
        </PromotionGrid>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="영구 삭제할까요?"
        description="영구 삭제한 프로모션은 복구할 수 없습니다."
        confirmLabel="영구 삭제"
        destructive
        loading={deleteMut.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
          setDeleteId(null);
        }}
      />
    </AppShell>
  );
}
