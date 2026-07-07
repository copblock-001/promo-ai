"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { updatePromotion } from "@/lib/db/promotions";
import { canProceedFrom, STEP_COUNT, stepPath } from "@/lib/wizard";
import { persistablePatch, useWizard } from "@/store/wizard";
import type { Promotion } from "@/types/promotion";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function WizardShell({
  promotion,
  profileName,
  children,
}: {
  promotion: Promotion;
  profileName: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const hydrate = useWizard((s) => s.hydrate);
  const state = useWizard();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // 현재 단계는 URL에서 (복귀 시 서버가 current_step 으로 라우팅)
  const match = pathname.match(/step-(\d)/);
  const step = match ? Number(match[1]) : promotion.current_step || 1;

  // DB 값으로 1회 하이드레이트(복귀 로직)
  useEffect(() => {
    hydrate(promotion);
  }, [promotion.id, hydrate, promotion]);

  const saveNow = useCallback(async () => {
    const s = useWizard.getState();
    if (!s.id) return;
    setSaveStatus("saving");
    try {
      await updatePromotion(getBrowserSupabase(), s.id, persistablePatch(s));
      useWizard.getState().markSaved();
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, []);

  // 자동 저장 (디바운스 1.5s) — SPEC 공통 규칙
  const snapshot = useWizard((s) => JSON.stringify(persistablePatch(s)));
  useEffect(() => {
    if (!state.hydrated || !state.dirty) return;
    const t = setTimeout(() => {
      void saveNow();
    }, 1500);
    return () => clearTimeout(t);
  }, [snapshot, state.hydrated, state.dirty, saveNow]);

  const canProceed = canProceedFrom(step, state);

  const navigate = useCallback(
    async (target: number) => {
      useWizard.getState().setCurrentStep(target);
      await saveNow();
      router.push(stepPath(promotion.id, target));
    },
    [promotion.id, router, saveNow],
  );

  function onPrev() {
    if (step <= 1) {
      router.push("/dashboard");
      return;
    }
    void navigate(step - 1);
  }

  function onNext() {
    if (step < STEP_COUNT && canProceed) void navigate(step + 1);
  }

  function onGenerate() {
    // TODO(m11): 결과물 산출(PNG/HTML export) 파이프라인 연결
    window.alert("생성하기는 마일스톤 11에서 구현됩니다.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* 상단 바: 스텝퍼 + 저장상태 + 저장/이전/다음 + 프로필 */}
      <header className="sticky top-0 z-10 flex items-center gap-4 overflow-x-auto border-b border-border bg-surface px-6 py-3">
        <Stepper current={step} className="shrink-0" />

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <SaveIndicator status={saveStatus} />

          {step >= 4 && (
            <Button variant="outline" onClick={() => void saveNow()}>
              저장
            </Button>
          )}

          <Button variant="outline" pill onClick={onPrev}>
            이전
          </Button>

          {step < STEP_COUNT ? (
            <Button pill onClick={onNext} disabled={!canProceed}>
              다음
            </Button>
          ) : (
            <Button pill onClick={onGenerate}>
              <Sparkles className="h-4 w-4" />
              생성하기
            </Button>
          )}

          {/* TODO(asset): 아바타 이미지 교체 */}
          <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-primary text-sm font-semibold text-white">
            {profileName.slice(0, 1)}
          </span>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1 text-sm text-text-sub">
        <Loader2 className="h-4 w-4 animate-spin" /> 저장 중...
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1 text-sm text-status-progress">
        <Check className="h-4 w-4" /> 저장됨
      </span>
    );
  if (status === "error")
    return <span className="text-sm text-red-600">저장 실패</span>;
  return null;
}
