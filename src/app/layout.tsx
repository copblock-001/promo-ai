import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Promo.ai — 프로모션을 만드는 가장 쉬운 방법",
  description:
    "기획·디자인·개발 지식 없이도 5단계 위저드로 프로모션 원페이지를 완성하는 노코드 빌더.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/*
        TODO(asset): Pretendard 웹폰트(로컬 또는 CDN) 추가.
        현재는 system-ui 폴백 사용.
      */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
