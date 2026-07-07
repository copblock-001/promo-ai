"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { ArrowLeft, Check, Download, FileCode2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { updatePromotion } from "@/lib/db/promotions";
import { uploadToBucket } from "@/lib/storage";
import { buildHtmlDocument } from "@/lib/export-html";
import { PromotionRenderer } from "@/components/promotion/PromotionRenderer";
import type { Promotion } from "@/types/promotion";

type Phase = "generating" | "done" | "error";

/** SCR 결과물 — 프리뷰 + PNG 저장 + HTML export (SPEC 부록 B-2) */
export function ResultView({ promotion }: { promotion: Promotion }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("generating");
  const [error, setError] = useState<string | null>(null);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [htmlBlobUrl, setHtmlBlobUrl] = useState<string | null>(null);
  const ranRef = useRef(false);

  const generate = useCallback(async () => {
    if (!captureRef.current) return;
    setPhase("generating");
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      // 1) PNG 캡처
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      setPngDataUrl(dataUrl);

      // 2) 썸네일 업로드 (대시보드 카드용)
      const blob = await (await fetch(dataUrl)).blob();
      const { publicUrl: thumbnailUrl } = await uploadToBucket(
        supabase,
        "thumbnails",
        user.id,
        blob,
        { path: `${user.id}/${promotion.id}.png`, upsert: true, contentType: "image/png" },
      );

      // 3) HTML export — 렌더된 프리뷰 DOM 마크업으로 자기완결 HTML 생성
      const markup = captureRef.current?.innerHTML ?? "";
      const html = buildHtmlDocument(
        promotion.name?.trim() || "프로모션",
        markup,
      );
      const htmlBlob = new Blob([html], { type: "text/html" });
      setHtmlBlobUrl(URL.createObjectURL(htmlBlob));
      const { publicUrl: exportHtmlUrl } = await uploadToBucket(
        supabase,
        "exports",
        user.id,
        htmlBlob,
        {
          path: `${user.id}/${promotion.id}.html`,
          upsert: true,
          contentType: "text/html",
        },
      );

      // 4) 상태/URL 반영 (draft/in_progress → done)
      await updatePromotion(supabase, promotion.id, {
        status: "done",
        thumbnail_url: thumbnailUrl,
        export_html_url: exportHtmlUrl,
      });

      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "결과물 생성에 실패했습니다.");
      setPhase("error");
    }
  }, [promotion.id, promotion.name]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    // 렌더 후 캡처
    const t = setTimeout(() => void generate(), 300);
    return () => clearTimeout(t);
  }, [generate]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-text-sub hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" /> 대시보드로
        </Link>
        <StatusPill phase={phase} onRetry={generate} />
      </header>

      <h1 className="text-2xl font-bold">
        {promotion.name?.trim() || "제목 없는 프로모션"}
      </h1>

      {error && (
        <p className="rounded-input bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* 다운로드 액션 */}
      <div className="flex flex-wrap gap-3">
        <Button
          pill
          disabled={!pngDataUrl}
          onClick={() => download(pngDataUrl!, `${fileBase(promotion)}.png`)}
        >
          <Download className="h-4 w-4" /> 이미지(PNG) 저장
        </Button>
        <Button
          variant="outline"
          pill
          disabled={!htmlBlobUrl}
          onClick={() => download(htmlBlobUrl!, `${fileBase(promotion)}.html`)}
        >
          <FileCode2 className="h-4 w-4" /> HTML 다운로드
        </Button>
      </div>

      {/* 프리뷰(캡처 대상) */}
      <div className="overflow-hidden rounded-card border border-border shadow-sm">
        <div ref={captureRef} className="bg-surface">
          <PromotionRenderer sections={promotion.layout.sections ?? []} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  phase,
  onRetry,
}: {
  phase: Phase;
  onRetry: () => void;
}) {
  if (phase === "generating")
    return (
      <span className="flex items-center gap-1 text-sm text-text-sub">
        <Loader2 className="h-4 w-4 animate-spin" /> 결과물 생성 중...
      </span>
    );
  if (phase === "done")
    return (
      <span className="flex items-center gap-1 text-sm text-status-progress">
        <Check className="h-4 w-4" /> 생성 완료
      </span>
    );
  return (
    <button
      type="button"
      onClick={onRetry}
      className="text-sm font-medium text-primary hover:underline"
    >
      다시 시도
    </button>
  );
}

function fileBase(p: Promotion): string {
  return (p.name?.trim() || "promotion").replace(/[^\w가-힣-]+/g, "_");
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
