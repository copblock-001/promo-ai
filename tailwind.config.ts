import type { Config } from "tailwindcss";

/**
 * 디자인 토큰은 SPEC 6장(디자인 시스템 토큰) 기준.
 * 실제 HEX는 globals.css의 CSS 변수에서 단일 출처로 관리하고,
 * Tailwind는 var(...)로 참조한다.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          weak: "var(--color-primary-weak)",
          strong: "var(--color-primary-strong)",
        },
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: {
          DEFAULT: "var(--color-text)",
          sub: "var(--color-text-sub)",
        },
        status: {
          progress: "var(--status-progress)",
          done: "var(--status-done)",
          draft: "var(--status-draft)",
        },
      },
      borderRadius: {
        card: "var(--radius-card)",
        input: "var(--radius-input)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Pretendard", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
