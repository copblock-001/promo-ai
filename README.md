# Promo.ai

기획·디자인·개발 지식 없이도 **5단계 위저드**로 프로모션 원페이지를 완성하는 노코드 빌더.
전체 사양은 [`docs/SPEC.md`](docs/SPEC.md), 수동 설정은 [`docs/SETUP.md`](docs/SETUP.md) 참고.

## 스택
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase(Auth·DB·Storage) ·
TanStack Query · Zustand · dnd-kit · html-to-image · Anthropic Claude API

## 주요 기능
- **인증**: 아이디(닉네임) + 4자리 PIN, 아이디/비밀번호 찾기(합성 이메일 매핑, RLS 유지)
- **대시보드/아카이브**: 카드 그리드·검색·정렬·상태배지·복제/아카이브/삭제
- **5단계 위저드**: 정보 입력 → 목적 선택 → 프로토타입(초기 레이아웃 프리셋) → 컴포넌트 수정(3패널 에디터·변형·DnD) → 콘텐츠 입력(동적 필드·양방향 프리뷰·이미지 업로드)
- **AI**: `AI로 채우기`(`/api/ai/fill`) — Claude로 한국어 카피 자동 생성(서버 전용)
- **결과물**: 프리뷰 + PNG 저장(썸네일) + 자기완결 HTML export
- **관리자**: DB Debug 데이터 점검 뷰

## 로컬 개발
```bash
npm install
cp .env.example .env.local   # 값 입력 (아래 환경 변수 참고)
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build
```

## 환경 변수 (`.env.local`)
| 키 | 용도 | 노출 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 익명 키 | 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 작업(우회 권한) | 서버 전용 |
| `ANTHROPIC_API_KEY` | AI 카피 생성 | 서버 전용 |
| `AUTH_PIN_PEPPER` | PIN 파생·재설정 토큰 서명 | 서버 전용 |
| `ANTHROPIC_MODEL` | (선택) 모델 ID 재정의 | 서버 전용 |

## DB 마이그레이션
Supabase → SQL Editor 에서 순서대로 실행 (또는 `supabase db push`):
1. `supabase/migrations/0001_profiles.sql`
2. `supabase/migrations/0002_promotions.sql`
3. `supabase/migrations/0003_storage.sql`

자세한 단계는 [`docs/SETUP.md`](docs/SETUP.md).

## 배포 (Vercel 권장)
1. 저장소를 Vercel에 Import (프레임워크: Next.js — 자동 인식)
2. **Settings → Environment Variables** 에 위 6개 변수 등록
   (`NEXT_PUBLIC_*`는 빌드/런타임 모두, 나머지는 서버 전용)
3. Deploy. 빌드는 `next build`, 출력은 자동.
4. Supabase 프로젝트에 마이그레이션이 적용되어 있어야 로그인/저장이 동작합니다.

> 참고: HTML export는 현재 Tailwind Play CDN을 임베드하는 MVP 방식입니다(부록 B-2 옵션 3).
> 로고·3D 비주얼·예시/썸네일 등 실제 에셋 자리는 코드에 `// TODO(asset)`으로 표시되어 있습니다.
