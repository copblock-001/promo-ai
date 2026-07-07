"use client";

import { Input } from "@/components/ui/input";
import { useWizard } from "@/store/wizard";

/** SCR-03 · Step1 프로모션 정보 입력 (좌측 폼 + 우측 예시 갤러리) */
export function Step1Form() {
  const name = useWizard((s) => s.name);
  const brandName = useWizard((s) => s.brand_name);
  const managerName = useWizard((s) => s.manager_name);
  const patch = useWizard((s) => s.patch);

  return (
    <div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-2">
      {/* 좌측 폼 */}
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">프로모션 정보 입력</h1>
          <p className="text-sm text-text-sub">
            프로모션 생성에 필요한 기본 정보를 입력해주세요.
          </p>
        </header>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">프로모션 이름</span>
          <Input
            value={name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="프로모션의 이름을 작성해주세요."
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">브랜드 이름</span>
          <Input
            value={brandName}
            onChange={(e) => patch({ brand_name: e.target.value })}
            placeholder="프로모션이 활용 될 브랜드 이름을 작성해주세요."
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">담당자 이름</span>
          <Input
            value={managerName}
            onChange={(e) => patch({ manager_name: e.target.value })}
            placeholder="프로모션 담당자의 이름을 작성해주세요."
          />
        </label>
      </div>

      {/* 우측 예시 갤러리 (정적) */}
      <div className="flex flex-col gap-4 rounded-card bg-surface p-6">
        {/* TODO(asset): 다양한 프로모션 디자인 예시 이미지로 교체 */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-input bg-primary-weak"
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-sm text-text-sub">
          Promo.ai는 고객의 프로모션 목적에 최적화된 다양한 디자인을 제공합니다.
          복잡한 기획 없이도 목적에 맞는 프로모션을 빠르게 제작할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
