import { WIZARD_STEPS } from "@/components/ui/stepper";

/** Step2~5 자리표시자 (실제 폼/프리뷰는 마일스톤 6·8·9에서 구현) */
export function StepPlaceholder({ step }: { step: number }) {
  const title = WIZARD_STEPS[step - 1] ?? `Step ${step}`;
  const milestone =
    step === 2 || step === 3
      ? "마일스톤 6"
      : step === 4
        ? "마일스톤 8"
        : "마일스톤 9";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-col gap-3 rounded-card border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-sm font-medium text-primary">Step {step}</p>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-text-sub">
          이 단계의 화면은 {milestone}에서 구현됩니다. 위저드 셸(스텝퍼 · 이전/다음 ·
          저장 · 자동저장 · 복귀)은 지금 동작합니다.
        </p>
      </div>
    </div>
  );
}
