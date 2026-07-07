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
| `AUTH_PIN_PEPPER` | 4자리 PIN 파생 비밀번호·재설정 토큰 서명 | **서버 전용** |

`.env.local`은 `.gitignore`로 제외되어 커밋되지 않습니다. **시크릿을 코드에 하드코딩하지 마세요.**

> **인증 방식 (변경됨):** 이메일/Google 로그인 대신 **아이디(닉네임) + 4자리 PIN** 방식을 사용합니다.
> 내부적으로 Supabase Auth에 합성 이메일과 PIN 파생 비밀번호를 저장하므로,
> **Google OAuth·이메일 인증 설정은 필요 없습니다.** 대신 `SUPABASE_SERVICE_ROLE_KEY`와
> `AUTH_PIN_PEPPER`가 반드시 필요합니다. `AUTH_PIN_PEPPER`는 `openssl rand -base64 48` 등으로 생성하세요.

---

## 수동 설정 체크리스트 (SPEC 0.4)

- [ ] **1. Supabase 프로젝트 생성** → `Project URL` / `anon` / `service_role` 키를 `.env.local`에 입력
      - https://supabase.com/dashboard → New project
      - Project Settings → API 에서 URL과 두 키 확인
      - _(필요 마일스톤: 인증 / 데이터 계층부터. 부트스트랩만 확인할 때는 생략 가능하나, 입력해두면 좋습니다.)_

- [ ] **2. DB 마이그레이션 적용**
      - **인증(마일스톤 2):** `supabase/migrations/0001_profiles.sql` 실행 → `profiles` 테이블 + `user_role` enum + RLS 생성. **인증이 동작하려면 필수입니다.**
      - **데이터 계층(마일스톤 3):** `promotions` 테이블/enum은 이후 마일스톤에서 추가됩니다.
      - 적용: Supabase Dashboard → SQL Editor 에 붙여넣어 실행, 또는 Supabase CLI (`supabase db push`).

- [ ] **3. `AUTH_PIN_PEPPER` 설정** → 긴 랜덤 문자열을 `.env.local`에 입력 (`openssl rand -base64 48`)
      - _(필요 마일스톤: 인증)_ · ⚠️ 운영 중 값을 변경하면 기존 사용자 로그인이 불가능해집니다.

- [ ] **4. Storage 버킷 생성**: `assets`, `thumbnails`, `exports` (정책 포함)
      - "데이터 계층" 마일스톤에서 정책 SQL과 함께 안내됩니다.

- [ ] ~~**Google OAuth 설정**~~ — **불필요**. 로그인 방식이 아이디+4자리 PIN으로 변경되어 Google/이메일 인증을 사용하지 않습니다. (합성 이메일은 서버가 자동 확인 처리)

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
