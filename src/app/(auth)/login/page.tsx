import { BrandPanel } from "@/components/auth/BrandPanel";
import { AuthCard } from "@/components/auth/AuthCard";

/** 내부 경로만 허용(오픈 리다이렉트 방지) */
function safeRedirect(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string | string[] };
}) {
  const redirectTo = safeRedirect(searchParams?.redirect);

  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* 좌: 브랜드 패널 (모바일에서는 상단 축소) */}
        <div className="hidden md:block">
          <BrandPanel />
        </div>
        <div className="md:hidden">
          <div className="p-6">
            <BrandPanelCompact />
          </div>
        </div>

        {/* 우: 폼 */}
        <div className="flex items-center justify-center px-6 py-12">
          <AuthCard redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}

/** 모바일 상단용 축소 브랜드 헤더 */
function BrandPanelCompact() {
  return (
    <div
      className="rounded-card px-5 py-6 text-white"
      style={{
        background:
          "linear-gradient(160deg, var(--color-primary-strong) 0%, var(--color-primary) 100%)",
      }}
    >
      {/* TODO(asset): 로고 에셋 교체 */}
      <p className="text-lg font-bold">Promo.ai</p>
      <p className="mt-1 text-sm text-white/80">
        프로모션을 만드는 가장 쉬운 방법
      </p>
    </div>
  );
}
