import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";

/**
 * 임시 랜딩 / 부트스트랩 확인 페이지.
 * 디자인 토큰과 공통 UI 컴포넌트가 정상 동작하는지 보여준다.
 * 실제 SCR-01(로그인)·SCR-02(대시보드)는 다음 마일스톤에서 구현.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        {/* TODO(asset): Promo.ai 로고 에셋으로 교체 */}
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Sparkles className="h-6 w-6" />
          Promo.ai
        </div>
        <h1 className="text-3xl font-bold">
          아이디어부터 완성까지,
          <br />
          <span className="underline decoration-primary decoration-4 underline-offset-4">
            프로모션을 만드는 가장 쉬운 방법
          </span>
        </h1>
        <p className="text-text-sub">
          부트스트랩 마일스톤 — 디자인 토큰 · 공통 UI 컴포넌트 확인용 페이지입니다.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">위저드 스텝퍼</h2>
        <Stepper current={2} />
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">버튼</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" pill>
            다음
          </Button>
          <Button variant="primary" pill>
            <Sparkles className="h-4 w-4" /> 생성하기
          </Button>
          <Button variant="outline" pill>
            이전
          </Button>
          <Button variant="primary" disabled pill>
            다음 (비활성)
          </Button>
          <Button variant="ghost">텍스트 버튼</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">상태 배지</h2>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="draft" />
          <StatusBadge status="in_progress" />
          <StatusBadge status="done" />
        </div>
      </section>

      <footer className="text-sm text-text-sub">
        다음 마일스톤:{" "}
        <Link href="/" className="text-primary underline">
          인증(SCR-01)
        </Link>
      </footer>
    </main>
  );
}
