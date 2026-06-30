# Promo.ai 설정 가이드 (수동 작업)

이 문서는 **Claude Code가 자동으로 처리할 수 없는**, 사람이 직접 외부 콘솔에서 수행해야 하는 작업을 정리합니다(SPEC 0.4 기준). 코드로 생성되는 SQL 마이그레이션·RLS 정책·`.env.example`은 이 저장소에 포함되며, **실제 키 발급/등록은 사용자가 수행**합니다.

> 마일스톤별로 필요한 항목이 다릅니다. 부트스트랩(마일스톤 1) 단계에서 **필수**인 항목은 아래 1번뿐이며, 나머지는 해당 마일스톤에서 필요해질 때 처리하면 됩니다.

---

## 환경 변수 (`.env.local`)

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 키 | 용도 | 노출 범위 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 익명 키 | 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 작업용(우회 권한) | **서버 전용** |
| `ANTHROPIC_API_KEY` | LLM 호출 | **서버 전용** |

`.env.local`은 `.gitignore`로 제외되어 커밋되지 않습니다. **시크릿을 코드에 하드코딩하지 마세요.**

---

## 수동 설정 체크리스트 (SPEC 0.4)

- [ ] **1. Supabase 프로젝트 생성** → `Project URL` / `anon` / `service_role` 키를 `.env.local`에 입력
      - https://supabase.com/dashboard → New project
      - Project Settings → API 에서 URL과 두 키 확인
      - _(필요 마일스톤: 인증 / 데이터 계층부터. 부트스트랩만 확인할 때는 생략 가능하나, 입력해두면 좋습니다.)_

- [ ] **2. DB 마이그레이션 적용** (생성된 SQL 실행: `profiles`, `promotions` 테이블 + enum + RLS)
      - SQL 파일은 **"데이터 계층" 마일스톤**에서 `supabase/migrations/` 에 생성됩니다.
      - 적용: Supabase Dashboard → SQL Editor 에 붙여넣어 실행, 또는 Supabase CLI (`supabase db push`).

- [ ] **3. Storage 버킷 생성**: `assets`, `thumbnails`, `exports` (정책 포함)
      - "데이터 계층" 마일스톤에서 정책 SQL과 함께 안내됩니다.

- [ ] **4. Google OAuth 설정** (이 단계 없으면 SCR-01 구글 로그인 동작 불가)
      - Google Cloud Console → OAuth 클라이언트 ID/Secret 발급
      - Supabase Dashboard → Authentication → Providers → Google 에 Client ID/Secret 등록
      - Redirect URL 등록: `https://<project-ref>.supabase.co/auth/v1/callback`
      - _(필요 마일스톤: 인증)_

- [ ] **5. Anthropic API 키 발급** → `ANTHROPIC_API_KEY`를 `.env.local`에 입력
      - https://console.anthropic.com/
      - _(필요 마일스톤: AI 연동)_

- [ ] **6. (배포 시) 동일 환경 변수**를 호스팅 플랫폼(Vercel 등)에 등록

---

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

> 부트스트랩 단계에서는 Supabase 클라이언트가 import만 되고 실제 호출은 없으므로, `.env.local` 없이도 홈 페이지(`/`)는 동작합니다. 인증/데이터 마일스톤부터 환경 변수가 필요합니다.
