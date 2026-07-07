import { Sparkles } from "lucide-react";

/**
 * SCR-01 좌측 브랜드 패널.
 * 보라 그라데이션 + 헤드라인/서브카피.
 * TODO(asset): 추상 3D 비주얼 이미지 에셋으로 교체(현재는 그라데이션만).
 */
export function BrandPanel() {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden p-10 text-white"
      style={{
        // SPEC 6장: primary-strong(딥 인디고) → primary 그라데이션
        background:
          "linear-gradient(160deg, var(--color-primary-strong) 0%, var(--color-primary) 100%)",
      }}
    >
      {/* TODO(asset): Promo.ai 로고 에셋으로 교체 */}
      <div className="flex items-center gap-2 text-xl font-bold">
        <Sparkles className="h-5 w-5" />
        Promo.ai
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold leading-snug">
          아이디어부터 완성까지,
          <br />
          <span className="underline decoration-white/70 decoration-4 underline-offset-4">
            프로모션을 만드는 가장 쉬운 방법
          </span>
        </h2>
        <p className="text-white/80">
          브랜딩·캠페인·콘텐츠까지 한 곳에서 완성하세요.
        </p>
      </div>

      {/* TODO(asset): 추상 3D 비주얼 자리 (플레이스홀더) */}
      <div
        className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
    </div>
  );
}
