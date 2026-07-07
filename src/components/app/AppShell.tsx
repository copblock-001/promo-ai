"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ChevronDown,
  FileText,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface ShellProfile {
  name: string;
  role: "member" | "admin";
}

const NAV = [
  { key: "dashboard", label: "모든 프로모션", href: "/dashboard", icon: FileText },
  { key: "archive", label: "아카이브", href: "/archive", icon: Archive },
] as const;

export function AppShell({
  active,
  profile,
  search,
  onSearchChange,
  topbarActions,
  children,
}: {
  active: "dashboard" | "archive";
  profile: ShellProfile;
  search?: string;
  onSearchChange?: (v: string) => void;
  topbarActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const roleLabel = profile.role === "admin" ? "관리자" : "멤버";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* 좌측 사이드바 */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        {/* TODO(asset): 로고 에셋 교체 */}
        <div className="flex items-center gap-2 px-5 py-5 text-lg font-bold text-primary">
          <Sparkles className="h-5 w-5" />
          Promo.ai
        </div>
        <nav className="flex flex-col gap-1 px-3 py-2">
          <p className="px-2 py-2 text-xs font-medium text-text-sub">프로젝트</p>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-input px-3 py-2 text-sm",
                  isActive
                    ? "bg-primary-weak font-medium text-primary-strong"
                    : "text-text hover:bg-bg",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 우측 본문 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단 바 */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-surface px-6 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-primary md:hidden"
          >
            <Sparkles className="h-5 w-5" />
          </Link>

          <div className="relative mx-auto w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-sub" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="h-10 pl-9"
              aria-label="프로모션 검색"
            />
          </div>

          <div className="flex items-center gap-2">
            {topbarActions}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-2 hover:bg-bg"
              >
                {/* TODO(asset): 아바타 이미지 교체 */}
                <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-primary text-sm font-semibold text-white">
                  {profile.name.slice(0, 1)}
                </span>
                <span className="hidden text-sm sm:block">
                  {profile.name}
                  <span className="ml-1 text-text-sub">{roleLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-text-sub" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1 w-40 rounded-input border border-border bg-surface py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-bg"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
