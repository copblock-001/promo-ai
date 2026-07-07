"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PIN_LENGTH,
  USERNAME_MAX,
  validateName,
  validatePin,
  validateUsername,
} from "@/lib/auth/validation";

type Mode = "login" | "signup" | "find-id" | "find-pw" | "reset";

interface Account {
  maskedUsername: string;
  resetToken: string;
}

/** 숫자만 남기고 4자리로 제한 */
function onlyDigits(v: string): string {
  return v.replace(/\D/g, "").slice(0, PIN_LENGTH);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
    </label>
  );
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data } as { ok: boolean; data: any };
}

export function AuthCard({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 공통 입력값
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");

  // 찾기
  const [findBy, setFindBy] = useState<"name" | "username">("name");
  const [findValue, setFindValue] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  // 재설정 컨텍스트
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetLabel, setResetLabel] = useState<string>("");

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
    setPin("");
    setPinConfirm("");
    setAccounts([]);
  }

  function goLoginWith(notice: string) {
    setMode("login");
    setError(null);
    setNotice(notice);
    setPin("");
    setPinConfirm("");
    setAccounts([]);
    setResetToken(null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await postJson("/api/auth/login", { username, pin });
    setLoading(false);
    if (!ok) return setError(data.error ?? "로그인에 실패했습니다.");
    router.push(redirectTo);
    router.refresh();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validateName(name) || validateUsername(username) || validatePin(pin);
    if (v) return setError(v);
    if (pin !== pinConfirm) return setError("비밀번호가 일치하지 않습니다.");
    setLoading(true);
    const { ok, data } = await postJson("/api/auth/signup", {
      name,
      username,
      pin,
    });
    setLoading(false);
    if (!ok) return setError(data.error ?? "회원가입에 실패했습니다.");
    router.push(redirectTo);
    router.refresh();
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setAccounts([]);
    const by = mode === "find-id" ? "name" : findBy;
    setLoading(true);
    const { ok, data } = await postJson("/api/auth/lookup", {
      by,
      value: findValue,
    });
    setLoading(false);
    if (!ok) return setError(data.error ?? "조회에 실패했습니다.");
    setAccounts(data.accounts ?? []);
  }

  function startReset(account: Account) {
    setResetToken(account.resetToken);
    setResetLabel(account.maskedUsername);
    setPin("");
    setPinConfirm("");
    setError(null);
    setNotice(null);
    setMode("reset");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validatePin(pin);
    if (v) return setError(v);
    if (pin !== pinConfirm) return setError("비밀번호가 일치하지 않습니다.");
    if (!resetToken) return setError("재설정 요청이 올바르지 않습니다. 다시 시도해주세요.");
    setLoading(true);
    const { ok, data } = await postJson("/api/auth/reset-password", {
      resetToken,
      newPin: pin,
    });
    setLoading(false);
    if (!ok) return setError(data.error ?? "비밀번호 재설정에 실패했습니다.");
    goLoginWith("비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.");
  }

  const feedback = (
    <>
      {error && (
        <p className="rounded-input bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-input bg-primary-weak px-3 py-2 text-sm text-primary-strong">
          {notice}
        </p>
      )}
    </>
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {mode === "login" && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">안녕하세요 :)</h1>
            <p className="text-2xl font-bold">Promo.ai 입니다.</p>
            <p className="mt-1 text-sm text-text-sub">
              프로모션 페이지 제작을 지금 프로모에서 시작하세요!
            </p>
          </header>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {feedback}
            <Field label="아이디">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력해주세요."
                maxLength={USERNAME_MAX}
                autoComplete="username"
              />
            </Field>
            <Field label="비밀번호 (숫자 4자리)">
              <Input
                value={pin}
                onChange={(e) => setPin(onlyDigits(e.target.value))}
                placeholder="••••"
                inputMode="numeric"
                type="password"
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          <div className="flex items-center justify-center gap-3 text-sm text-text-sub">
            <button type="button" onClick={() => switchMode("find-id")} className="hover:text-text">
              아이디 찾기
            </button>
            <span aria-hidden>·</span>
            <button type="button" onClick={() => switchMode("find-pw")} className="hover:text-text">
              비밀번호 찾기
            </button>
            <span aria-hidden>·</span>
            <button type="button" onClick={() => switchMode("signup")} className="font-medium text-primary hover:underline">
              회원가입
            </button>
          </div>
        </>
      )}

      {mode === "signup" && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">회원가입</h1>
            <p className="mt-1 text-sm text-text-sub">
              간단한 정보로 프로모를 시작하세요.
            </p>
          </header>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {feedback}
            <Field label="이름 (실명)">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요. (예: 홍슬기)"
                autoComplete="name"
              />
            </Field>
            <Field label={`아이디 (최대 ${USERNAME_MAX}자)`}>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="사용할 아이디를 입력해주세요."
                maxLength={USERNAME_MAX}
                autoComplete="username"
              />
            </Field>
            <Field label="비밀번호 (숫자 4자리)">
              <Input
                value={pin}
                onChange={(e) => setPin(onlyDigits(e.target.value))}
                placeholder="••••"
                inputMode="numeric"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Field label="비밀번호 확인">
              <Input
                value={pinConfirm}
                onChange={(e) => setPinConfirm(onlyDigits(e.target.value))}
                placeholder="••••"
                inputMode="numeric"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "가입 중..." : "회원가입"}
            </Button>
          </form>
          <BackToLogin onClick={() => switchMode("login")} />
        </>
      )}

      {(mode === "find-id" || mode === "find-pw") && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">
              {mode === "find-id" ? "아이디 찾기" : "비밀번호 찾기"}
            </h1>
            <p className="mt-1 text-sm text-text-sub">
              {mode === "find-id"
                ? "이름으로 아이디를 찾을 수 있습니다."
                : "이름 또는 아이디로 계정을 확인한 뒤 비밀번호를 재설정합니다."}
            </p>
          </header>
          <form onSubmit={handleLookup} className="flex flex-col gap-4">
            {feedback}
            {mode === "find-pw" && (
              <div className="flex gap-2">
                {(["name", "username"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFindBy(k)}
                    className={`flex-1 rounded-input border px-3 py-2 text-sm ${
                      findBy === k
                        ? "border-primary bg-primary-weak text-primary-strong"
                        : "border-border text-text-sub"
                    }`}
                  >
                    {k === "name" ? "이름으로" : "아이디로"}
                  </button>
                ))}
              </div>
            )}
            <Field
              label={
                mode === "find-id" || findBy === "name" ? "이름" : "아이디"
              }
            >
              <Input
                value={findValue}
                onChange={(e) => setFindValue(e.target.value)}
                placeholder={
                  mode === "find-id" || findBy === "name"
                    ? "이름을 입력해주세요."
                    : "아이디를 입력해주세요."
                }
              />
            </Field>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "확인 중..." : "확인"}
            </Button>
          </form>

          {accounts.length > 0 && (
            <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-4">
              <p className="text-sm text-text-sub">
                {mode === "find-id"
                  ? "확인된 아이디입니다. 뒷자리는 보안을 위해 가려집니다."
                  : "계정이 확인되었습니다."}
              </p>
              {accounts.map((acc) => (
                <div
                  key={acc.resetToken}
                  className="flex items-center justify-between gap-3 rounded-input bg-surface px-3 py-2"
                >
                  <span className="font-mono text-sm font-medium">
                    {acc.maskedUsername}
                  </span>
                  <button
                    type="button"
                    onClick={() => startReset(acc)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    비밀번호 재설정
                  </button>
                </div>
              ))}
            </div>
          )}

          <BackToLogin onClick={() => switchMode("login")} />
        </>
      )}

      {mode === "reset" && (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
            <p className="mt-1 text-sm text-text-sub">
              <span className="font-mono font-medium text-text">{resetLabel}</span>{" "}
              계정의 새 비밀번호(숫자 4자리)를 설정하세요.
            </p>
          </header>
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            {feedback}
            <Field label="새 비밀번호 (숫자 4자리)">
              <Input
                value={pin}
                onChange={(e) => setPin(onlyDigits(e.target.value))}
                placeholder="••••"
                inputMode="numeric"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Field label="새 비밀번호 확인">
              <Input
                value={pinConfirm}
                onChange={(e) => setPinConfirm(onlyDigits(e.target.value))}
                placeholder="••••"
                inputMode="numeric"
                type="password"
                autoComplete="new-password"
              />
            </Field>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "재설정 중..." : "비밀번호 재설정"}
            </Button>
          </form>
          <BackToLogin onClick={() => switchMode("login")} />
        </>
      )}
    </div>
  );
}

function BackToLogin({ onClick }: { onClick: () => void }) {
  return (
    <div className="text-center text-sm text-text-sub">
      <button type="button" onClick={onClick} className="hover:text-text">
        ← 로그인으로 돌아가기
      </button>
    </div>
  );
}
