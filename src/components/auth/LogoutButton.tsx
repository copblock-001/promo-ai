"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading}>
      <LogOut className="h-4 w-4" />
      {loading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}
