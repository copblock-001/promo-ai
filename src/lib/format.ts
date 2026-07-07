/** 수정 시각 표시 (SPEC SCR-02: "1일전 수정" / "2025. 11. 26. 수정") */
export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  if (diff < MIN) return "방금";
  if (diff < HOUR) return `${Math.floor(diff / MIN)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;

  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}
