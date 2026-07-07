"use client";

import { cn } from "@/lib/utils";
import { useWizard } from "@/store/wizard";
import {
  PURPOSE_DETAIL_LABEL,
  PURPOSE_MAIN_LABEL,
} from "@/lib/labels";
import type { PurposeDetail, PurposeMain } from "@/types/promotion";

/** SCR-04 · Step2 프로모션 목적 선택 */
export function Step2Form() {
  const purposeMain = useWizard((s) => s.purpose_main);
  const purposeDetail = useWizard((s) => s.purpose_detail);
  const patch = useWizard((s) => s.patch);

  return (
    <div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-2">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">프로모션 목적 선택</h1>
          <p className="text-sm text-text-sub">
            가장 적합한 목적을 선택해주세요.
          </p>
        </header>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">
            프로모션의 목적을 선택해주세요
          </legend>
          {(Object.keys(PURPOSE_MAIN_LABEL) as PurposeMain[]).map((key) => (
            <RadioRow
              key={key}
              checked={purposeMain === key}
              label={PURPOSE_MAIN_LABEL[key]}
              onSelect={() => patch({ purpose_main: key })}
            />
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">
            디테일한 목적을 선택해주세요
          </legend>
          {(Object.keys(PURPOSE_DETAIL_LABEL) as PurposeDetail[]).map((key) => (
            <RadioRow
              key={key}
              checked={purposeDetail === key}
              label={PURPOSE_DETAIL_LABEL[key]}
              onSelect={() => patch({ purpose_detail: key })}
            />
          ))}
        </fieldset>
      </div>

      {/* 우측 미리보기(정적) */}
      <div className="flex flex-col gap-4">
        <PreviewStat
          title="매출증진"
          big="₩ 3,103,256,000"
          sub="작년 대비 +22% 상승"
        />
        <PreviewStat
          title="고객 참여 활성화"
          big="98,060,512명"
          sub="구독자 · +10% mo/mo"
        />
        <p className="text-sm text-text-sub">
          Promo.ai는 사용자의 목표를 분석해 가장 효과적인 프로모션 유형과 디자인을
          제안합니다. 누구나 손쉽게 고품질 프로모션을 제작할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

function RadioRow({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-input border px-4 py-3 text-left text-sm",
        checked
          ? "border-primary bg-primary-weak"
          : "border-border hover:bg-bg",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-pill border",
          checked ? "border-primary" : "border-border",
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-pill bg-primary" />}
      </span>
      <span className={checked ? "font-medium text-primary-strong" : ""}>
        {label}
      </span>
    </button>
  );
}

function PreviewStat({
  title,
  big,
  sub,
}: {
  title: string;
  big: string;
  sub: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-sm text-text-sub">{title}</p>
      <p className="mt-1 text-2xl font-bold">{big}</p>
      <p className="mt-1 text-sm text-status-progress">{sub}</p>
    </div>
  );
}
