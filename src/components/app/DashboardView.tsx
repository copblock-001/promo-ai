"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AppShell, type ShellProfile } from "@/components/app/AppShell";
import { PromotionCard } from "@/components/app/PromotionCard";
import { PromotionGrid } from "@/components/app/PromotionGrid";
import { SORT_OPTIONS } from "@/lib/labels";
import type { SortKey } from "@/lib/db/promotions";
import {
  useCreatePromotion,
  useDeletePromotion,
  useDuplicatePromotion,
  usePromotions,
  useSetArchived,
} from "@/lib/db/use-promotions";

export function DashboardView({ profile }: { profile: ShellProfile }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: promotions, isLoading } = usePromotions({
    search,
    sort,
    archived: false,
  });
  const createMut = useCreatePromotion();
  const duplicateMut = useDuplicatePromotion();
  const archiveMut = useSetArchived();
  const deleteMut = useDeletePromotion();

  function openBuilder(id: string) {
    router.push(`/builder/${id}/step-1`);
  }

  async function handleCreate() {
    const created = await createMut.mutateAsync({
      name: "",
      brand_name: "",
      manager_name: "",
    });
    openBuilder(created.id);
  }

  const topbarActions = (
    <>
      {profile.role === "admin" && (
        <Button
          variant="outline"
          onClick={() =>
            // TODO(admin): DB Debug 도구는 마감 마일스톤에서 구현
            window.alert("DB Debug는 마감 마일스톤에서 제공됩니다.")
          }
          className="hidden sm:inline-flex"
        >
          <Database className="h-4 w-4" />
          DB Debug
        </Button>
      )}
      <Button pill onClick={handleCreate} disabled={createMut.isPending}>
        <Plus className="h-4 w-4" />
        {createMut.isPending ? "생성 중..." : "새 프로모션"}
      </Button>
    </>
  );

  return (
    <AppShell
      active="dashboard"
      profile={profile}
      search={search}
      onSearchChange={setSearch}
      topbarActions={topbarActions}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">모든 프로모션</h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-input border border-border bg-surface px-3 text-sm"
            aria-label="정렬"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <PromotionGrid
          isLoading={isLoading}
          isEmpty={!promotions || promotions.length === 0}
          emptyTitle={
            search ? "검색 결과가 없습니다." : "첫 프로모션을 만들어 보세요"
          }
          emptyAction={
            !search ? (
              <Button pill onClick={handleCreate} disabled={createMut.isPending}>
                <Plus className="h-4 w-4" />새 프로모션
              </Button>
            ) : null
          }
        >
          {promotions?.map((p) => (
            <PromotionCard
              key={p.id}
              promotion={p}
              mode="active"
              onOpen={() => openBuilder(p.id)}
              onEdit={() => openBuilder(p.id)}
              onDuplicate={() => duplicateMut.mutate(p.id)}
              onArchive={() => archiveMut.mutate({ id: p.id, archived: true })}
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
        </PromotionGrid>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="프로모션을 삭제할까요?"
        description="삭제한 프로모션은 복구할 수 없습니다."
        confirmLabel="삭제"
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
