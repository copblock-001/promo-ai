import "server-only";
import { createHash, createHmac, timingSafeEqual } from "crypto";

/**
 * 서버 전용 자격증명 헬퍼.
 * 이메일이 없는 "아이디 + 4자리 PIN" 방식을 Supabase Auth 위에 매핑한다.
 *
 * - 합성 이메일: auth.users 의 email 로 사용 (사용자에게 노출되지 않음).
 * - 파생 비밀번호: 4자리 PIN을 서버 pepper로 HMAC → 긴 문자열.
 *   · Supabase 최소 비밀번호 길이 제약을 우회하고,
 *   · DB(bcrypt 해시)가 유출돼도 pepper 없이는 PIN 오프라인 브루트포스가 어렵다.
 *
 * ⚠️ 4자리 PIN은 본질적으로 저강도이며, 이름 기반 재설정도 강한 신원확인이 아니다.
 *    운영 전환 시 OTP/레이트리밋 등 강화를 권장한다. (// TODO(security))
 */

const EMAIL_DOMAIN = "promo-ai.local";
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10분

function pepper(): string {
  const p = process.env.AUTH_PIN_PEPPER;
  if (!p) {
    throw new Error(
      "[Promo.ai] 환경 변수 AUTH_PIN_PEPPER 가 설정되지 않았습니다. .env.local 을 확인하세요 (SPEC 0.4).",
    );
  }
  return p;
}

/** 아이디 정규화(유니코드 NFC). 이메일/비밀번호 파생·조회에서 일관성 유지. */
export function normalizeUsername(username: string): string {
  return username.normalize("NFC");
}

/** 아이디 → 합성 이메일 (결정적). */
export function usernameToEmail(username: string): string {
  const hash = createHash("sha256")
    .update(normalizeUsername(username))
    .digest("hex")
    .slice(0, 40);
  return `u-${hash}@${EMAIL_DOMAIN}`;
}

/** (아이디, PIN) → Supabase 비밀번호 (결정적, pepper 적용). */
export function derivePassword(username: string, pin: string): string {
  return createHmac("sha256", pepper())
    .update(`${normalizeUsername(username)}:${pin}`)
    .digest("base64");
}

/** 비밀번호 재설정용 서명 토큰 발급 (profileId 바인딩, 단기 만료). */
export function signResetToken(profileId: string): string {
  const exp = Date.now() + RESET_TOKEN_TTL_MS;
  const payload = `${profileId}.${exp}`;
  const sig = createHmac("sha256", pepper()).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

/** 재설정 토큰 검증 → 유효하면 profileId, 아니면 null. */
export function verifyResetToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;

  let payload: string;
  try {
    payload = Buffer.from(b64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = createHmac("sha256", pepper())
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf))
    return null;

  const [profileId, expStr] = payload.split(".");
  if (!profileId || !expStr) return null;
  if (Date.now() > Number(expStr)) return null;
  return profileId;
}
