import { ImageIcon, Play, Search, ShoppingCart } from "lucide-react";

/**
 * 컴포넌트 렌더 라이브러리 (SPEC 부록 A / 마일스톤 7).
 * componentType → 렌더 컴포넌트. 변형(variantId)은 레이아웃/스타일만 변경(콘텐츠 호환).
 * 순수 표현 컴포넌트(훅 없음) → 프리뷰/HTML export 양쪽에서 재사용.
 */

type Content = Record<string, any>;
interface RenderProps {
  content: Content;
  variantId: string;
}

function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-primary-weak text-primary/40 ${className}`}
    >
      {/* TODO(asset): 실제 이미지 업로드/표시 (Step5) */}
      <ImageIcon className="h-8 w-8" />
    </div>
  );
}

function Img({ src, className }: { src?: string; className?: string }) {
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`object-cover ${className}`} />;
  return <ImagePlaceholder className={className} />;
}

function GNB_LNB({ content, variantId }: RenderProps) {
  const menu: string[] = Array.isArray(content.menu) ? content.menu : [];
  const center = variantId === "GNB#02";
  return (
    <header className="flex items-center gap-6 border-b border-border bg-surface px-8 py-4">
      <span
        className={`font-bold text-text ${center ? "order-2 mx-auto" : ""}`}
      >
        {content.logo || "BRAND"}
      </span>
      <nav
        className={`flex gap-5 text-sm text-text-sub ${center ? "order-1" : ""}`}
      >
        {menu.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </nav>
      <div className={`flex items-center gap-3 text-text-sub ${center ? "order-3" : "ml-auto"}`}>
        <Search className="h-4 w-4" />
        <ShoppingCart className="h-4 w-4" />
      </div>
    </header>
  );
}

function KV({ content, variantId }: RenderProps) {
  const center = variantId === "KV#t3";
  return (
    <section
      className="relative overflow-hidden px-8 py-16"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary-strong), var(--color-primary))",
      }}
    >
      <div
        className={`mx-auto flex max-w-4xl flex-col gap-4 text-white ${center ? "items-center text-center" : "items-start"}`}
      >
        {content.label ? (
          <span className="rounded-pill bg-white/20 px-3 py-1 text-xs font-medium">
            {content.label}
          </span>
        ) : null}
        <h2 className="text-3xl font-bold">{content.headline || "헤드라인"}</h2>
        <p className="text-white/85">{content.description}</p>
        <div className="mt-2 flex gap-3">
          {content.textButton ? (
            <span className="text-sm font-medium underline underline-offset-4">
              {content.textButton}
            </span>
          ) : null}
          {content.solidButton ? (
            <span className="rounded-pill bg-white px-5 py-2 text-sm font-semibold text-primary">
              {content.solidButton}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ContentsCard({ content, variantId }: RenderProps) {
  const side = variantId === "CC#02";
  return (
    <section className="px-8 py-10">
      <div
        className={`mx-auto flex max-w-4xl gap-6 ${side ? "flex-row items-center" : "flex-col"}`}
      >
        <Img
          className={
            side ? "h-40 w-56 shrink-0 rounded-card" : "h-48 w-full rounded-card"
          }
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">{content.title || "제목"}</h3>
          <p className="text-text-sub">{content.description}</p>
          {content.link ? (
            <span className="text-sm font-medium text-primary">자세히 보기 →</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ content, variantId }: RenderProps) {
  const horizontal = variantId === "PC#02";
  return (
    <section className="px-8 py-10">
      <div
        className={`mx-auto flex max-w-3xl overflow-hidden rounded-card border border-border bg-surface ${horizontal ? "flex-row" : "flex-col"}`}
      >
        <div className="relative">
          <Img className={horizontal ? "h-44 w-44" : "h-52 w-full"} />
          {content.badge ? (
            <span className="absolute left-3 top-3 rounded-pill bg-primary px-2 py-0.5 text-xs font-semibold text-white">
              {content.badge}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-5">
          <h3 className="text-lg font-bold">{content.productName || "제품명"}</h3>
          <p className="text-sm text-text-sub">{content.description}</p>
          <p className="mt-2 text-xl font-bold text-primary">
            {content.price ? `${content.price}원` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function KVTabContainer({ content }: RenderProps) {
  const tabs: string[] = Array.isArray(content.tabs) ? content.tabs : [];
  return (
    <section className="px-8 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex gap-2 border-b border-border">
          {tabs.map((t, i) => (
            <span
              key={i}
              className={`px-4 py-2 text-sm ${i === 0 ? "border-b-2 border-primary font-medium text-primary" : "text-text-sub"}`}
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-4 text-text-sub">{content.description}</p>
      </div>
    </section>
  );
}

function Video({ content }: RenderProps) {
  return (
    <section className="px-8 py-10">
      <div className="relative mx-auto flex aspect-video max-w-3xl items-center justify-center overflow-hidden rounded-card bg-black/80 text-white">
        {content.poster ? <Img src={content.poster} className="absolute inset-0 h-full w-full" /> : null}
        <span className="relative flex h-14 w-14 items-center justify-center rounded-pill bg-white/90 text-primary">
          <Play className="h-6 w-6" />
        </span>
      </div>
    </section>
  );
}

function RTB({ content }: RenderProps) {
  const items: string[] = Array.isArray(content.items) ? content.items : [];
  return (
    <section className="bg-surface px-8 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h3 className="text-xl font-bold">{content.title || "구매 이유"}</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-card border border-border p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-primary-weak font-bold text-primary">
                {i + 1}
              </span>
              <p className="text-sm font-medium">{it}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ content }: RenderProps) {
  const items: string[] = Array.isArray(content.items) ? content.items : [];
  return (
    <section className="px-8 py-12">
      <div className="mx-auto max-w-3xl">
        <h3 className="mb-4 text-xl font-bold">자주 묻는 질문</h3>
        <div className="flex flex-col divide-y divide-border rounded-card border border-border">
          {items.map((it, i) => {
            const [q, a] = it.split("::").map((s) => s.trim());
            return (
              <div key={i} className="flex flex-col gap-1 p-4">
                <p className="font-medium">Q. {q}</p>
                {a ? <p className="text-sm text-text-sub">A. {a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Disclaimer({ content }: RenderProps) {
  return (
    <footer className="bg-bg px-8 py-10 text-center">
      <p className="mx-auto max-w-3xl text-xs leading-relaxed text-text-sub">
        {content.text}
      </p>
      {content.notice ? (
        <p className="mt-3 text-xs text-text-sub">{content.notice}</p>
      ) : null}
    </footer>
  );
}

export const RENDERERS: Record<
  string,
  (props: RenderProps) => React.ReactNode
> = {
  GNB_LNB,
  KV,
  ContentsCard,
  ProductCard,
  KVTabContainer,
  Video,
  RTB,
  FAQ,
  Disclaimer,
};

export function renderSection(
  componentType: string,
  content: Content,
  variantId: string,
): React.ReactNode {
  const R = RENDERERS[componentType];
  if (!R) return null;
  return <R content={content} variantId={variantId} />;
}
