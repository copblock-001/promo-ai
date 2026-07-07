/**
 * 자기완결 HTML export (SPEC 부록 B-2).
 * 이미 렌더된 프리뷰 DOM의 마크업(Tailwind 클래스 포함)을 받아
 * Tailwind Play CDN + 디자인 토큰을 임베드한 완전한 HTML 문서를 만든다.
 *
 * ⚠️ MVP: Tailwind CDN 방식(부록 B-2 옵션 3). 완전 오프라인 정밀 export는 후속 개선.
 * TODO(export): 사용 CSS 인라인화로 CDN 의존 제거.
 * TODO(asset): 디자인 토큰을 globals.css와 단일 출처로 관리.
 */

const TOKENS_CSS = `:root{
  --color-primary:#6c5ce7;--color-primary-weak:#efebff;--color-primary-strong:#2e1a6b;
  --color-bg:#f4f4f5;--color-surface:#ffffff;--color-border:#e5e5e8;
  --color-text:#1a1a1a;--color-text-sub:#8a8a8e;
  --status-progress:#2bbe6b;--status-done:#6c5ce7;--status-draft:#9aa0a6;
  --radius-card:16px;--radius-input:12px;--radius-pill:9999px;
}
body{margin:0;background:var(--color-bg);color:var(--color-text);font-family:system-ui,-apple-system,'Pretendard',sans-serif;}
img{max-width:100%;}`;

const TAILWIND_CONFIG = `tailwind.config={theme:{extend:{
colors:{primary:{DEFAULT:'var(--color-primary)',weak:'var(--color-primary-weak)',strong:'var(--color-primary-strong)'},bg:'var(--color-bg)',surface:'var(--color-surface)',border:'var(--color-border)',text:{DEFAULT:'var(--color-text)',sub:'var(--color-text-sub)'},status:{progress:'var(--status-progress)',done:'var(--status-done)',draft:'var(--status-draft)'}},
borderRadius:{card:'var(--radius-card)',input:'var(--radius-input)',pill:'var(--radius-pill)'}
}}}`;

export function buildHtmlDocument(title: string, bodyMarkup: string): string {
  const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>${TAILWIND_CONFIG}</script>
<style>${TOKENS_CSS}</style>
</head>
<body>
<main class="mx-auto max-w-3xl bg-surface">${bodyMarkup}</main>
</body>
</html>`;
}
