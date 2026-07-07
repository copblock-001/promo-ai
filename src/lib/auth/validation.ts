/**
 * 인증 입력 검증 (SCR-01, 변경된 로그인 방식).
 * - 이름: 한글 실명
 * - 아이디: 닉네임(한글/영문/숫자/특수문자), 공백 불가, 최대 15자
 * - 비밀번호: 숫자 4자리
 * 클라이언트/서버 공용(순수 함수, 시크릿 없음).
 */

export const NAME_RE = /^[가-힣]{2,10}$/; // 한글 2~10자
export const USERNAME_RE = /^\S{1,15}$/; // 공백 제외 1~15자
export const PIN_RE = /^\d{4}$/; // 숫자 4자리

export const USERNAME_MAX = 15;
export const PIN_LENGTH = 4;

export function validateName(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return "이름을 입력해주세요.";
  if (!NAME_RE.test(value.trim())) return "이름은 한글 2~10자로 입력해주세요.";
  return null;
}

export function validateUsername(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0)
    return "아이디를 입력해주세요.";
  if (value.length > USERNAME_MAX)
    return `아이디는 최대 ${USERNAME_MAX}자까지 가능합니다.`;
  if (!USERNAME_RE.test(value))
    return "아이디에 공백은 사용할 수 없습니다.";
  return null;
}

export function validatePin(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0)
    return "비밀번호를 입력해주세요.";
  if (!PIN_RE.test(value)) return "비밀번호는 숫자 4자리로 입력해주세요.";
  return null;
}

/** 아이디 앞 3자리만 노출하고 나머지는 * 처리 (아이디 찾기). */
export function maskUsername(username: string): string {
  const visible = username.slice(0, 3);
  const masked = "*".repeat(Math.max(0, username.length - 3));
  return visible + masked;
}
