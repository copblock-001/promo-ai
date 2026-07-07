"use client";

import { Calendar, Tag, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWizard } from "@/store/wizard";
import { PROTOTYPE_LABEL } from "@/lib/labels";
import { isPresetOrEmpty, presetLayout } from "@/lib/presets";
import type { PrototypeType } from "@/types/promotion";

const OPTIONS: {
  key: PrototypeType;
  icon: typeof Calendar;
  desc: string;
}[] = [
  {
    key: "event",
    icon: Calendar,
    desc: "이벤트 기간과 참여 방법을 명확하게 전달하는 레이아웃입니다.",
  },
  {
    key: "price",
    icon: Tag,
    desc: "할인가와 혜택을 전면에 배치하여 경쟁력을 강조한 레이아웃입니다.",
  },
  {
    key: "product",
    icon: Package,
    desc: "제품 이미지와 스펙을 중심으로 제품의 가치를 부각하는 레이아웃입니다.",
  },
];

/** SCR-05 · Step3 프로토타입 선택 (선택 시 부록 F 초기 레이아웃 세팅) */
export function Step3Form() {
  const prototypeType = useWizard((s) => s.prototype_type);
  const patch = useWizard((s) => s.patch);

  function select(type: PrototypeType) {
    const { layout } = useWizard.getState();
    // 사용자가 아직 편집하지 않은(프리셋/빈) 레이아웃이면 새 프리셋으로 교체
    if (isPresetOrEmpty(layout)) {
      patch({ prototype_type: type, layout: presetLayout(type) });
    } else {
      patch({ prototype_type: type });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-2">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">프로토타입 선택</h1>
          <p className="text-sm text-text-sub">
            프로토타입을 선택해주세요. 최적화된 레이아웃과 디자인을 추천합니다.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {OPTIONS.map(({ key, icon: Icon, desc }) => {
            const active = prototypeType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => select(key)}
                className={cn(
                  "flex items-start gap-4 rounded-card border p-4 text-left",
                  active
                    ? "border-primary bg-primary-weak"
                    : "border-border hover:bg-bg",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-input",
                    active ? "bg-primary text-white" : "bg-bg text-text-sub",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-semibold">{PROTOTYPE_LABEL[key]}</span>
                  <span className="text-sm text-text-sub">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 우측 미리보기(정적) */}
      <div className="flex flex-col gap-4 rounded-card bg-surface p-6">
        <div className="grid grid-cols-3 gap-3">
          {OPTIONS.map(({ key }) => (
            <div key={key} className="flex flex-col gap-2">
              {/* TODO(asset): 유형별 예시 이미지 교체 */}
              <div className="aspect-[3/4] rounded-input bg-primary-weak" />
              <p className="text-center text-xs text-text-sub">
                {PROTOTYPE_LABEL[key]}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-text-sub">
          Promo.ai는 SNS 참여·가격 강조·제품 강조의 3가지 유형을 제공해 목적에 맞는
          프로모션을 쉽고 빠르게 만들 수 있습니다.
        </p>
      </div>
    </div>
  );
}
