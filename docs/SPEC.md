Promo.ai — 기획서 & 기능명세서
> 원페이지 프로모션 빌더 SaaS · 바이브 코딩(Claude Code)용 통합 스펙
> 버전 **v1.1** · 작성 기준: 첨부 화면 12종 분석
>
> **변경 이력**
> - v1.1: 시작 지시문(0.3), 환경변수·수동 설정 체크리스트(0.4), 프로토타입 초기 레이아웃 프리셋(부록 F), HTML export 방식 구체화(B-2) 추가 — *실행 준비(runnable) 보강*
> - v1.0: 최초 작성(기획서 + 기능명세서)
---
0. 문서 개요 & 확정 전제
이 문서는 Claude Code로 Promo.ai를 구현하기 위한 단일 기준 문서입니다. Part 1(기획서) 은 무엇을/왜 만드는지, Part 2(기능명세서) 는 화면·동작·데이터를 정의하며, Part 3 는 구현 순서를 제안합니다.
0.1 확정 사항 (협의 완료)
항목	결정
구축 범위	프론트엔드 + Supabase(Auth · DB · Storage). 실제 로그인
AI 기능	실제 LLM API 연동 — `AI로 채우기`(카피 생성) + `생성하기`(결과물 산출)
최종 결과물	프리뷰 + 이미지(PNG) 저장 + HTML export
0.2 기본값 (별도 지시 없으면 이대로 진행)
항목	기본값
프레임워크	Next.js 14+ (App Router) + TypeScript
스타일	Tailwind CSS (+ 선택적 shadcn/ui), 아이콘 `lucide-react`
백엔드	Supabase (Postgres + Auth + Storage), 비밀키는 서버 Route Handler에서만 사용
LLM	Anthropic Claude API (서버 라우트 경유, 키 노출 금지). 교체 가능하도록 추상화
전역 상태	위저드 = Zustand, 서버데이터 = TanStack Query(또는 SWR)
드래그앤드롭	`@dnd-kit/core` (Adjustable 섹션 재배치)
이미지 캡처	`html-to-image`(클라이언트) — 썸네일/PNG 저장
언어/로케일	UI 전체 한국어, 통화 `ko-KR`(원)
레이아웃	빌더는 데스크톱 우선(최소 1280px 권장), 대시보드/로그인은 반응형
0.3 시작 방법 — Claude Code에 붙여넣을 지시문
> 이 문서는 채팅에 통째로 붙이기보다 **repo 내 `docs/SPEC.md`로 저장**하고, `CLAUDE.md`에서 참조시키는 것을 권장합니다(컨텍스트 안정성). 그 뒤 첫 턴에 아래 지시문을 사용하세요.
```text
docs/SPEC.md 기반으로 Promo.ai를 Part 3 마일스톤 순서대로 단계적으로 구축해줘.

규칙:
- 스택은 SPEC 0.2 기본값을 따른다.
- 모든 시크릿은 .env.local에 두고 하드코딩 금지(0.4 표 참고).
- 내가 직접 해야 하는 수동 작업(Supabase 프로젝트 생성, Google OAuth provider 설정,
  DB 마이그레이션 적용)은 0.4 체크리스트 기준으로 별도 정리해서 알려줘.
  SQL 마이그레이션 파일과 RLS 정책도 생성해줘.
- 로고/3D 비주얼/예시·프리뷰 이미지 등 실제 에셋은 임의 플레이스홀더로 대체하고
  교체 지점을 // TODO(asset) 주석으로 표시해.
- 컴포넌트 변형은 타입당 1~2개부터 시작(부록 A).
- 프로토타입 선택 시 초기 layout은 부록 F 프리셋을 사용.
- 각 마일스톤이 끝나면 멈추고 확인받아.

먼저 1번(부트스트랩)부터 시작해줘.
```
0.4 환경 변수 & 수동 설정 체크리스트
> 아래는 **Claude Code가 자동으로 처리할 수 없는** 작업입니다. 코드 생성 전/중에 사람이 직접 수행해야 합니다.
환경 변수 (`.env.local`)
키	용도	노출 범위
`NEXT_PUBLIC_SUPABASE_URL`	Supabase 프로젝트 URL	클라이언트
`NEXT_PUBLIC_SUPABASE_ANON_KEY`	익명 키	클라이언트
`SUPABASE_SERVICE_ROLE_KEY`	서버 작업용(우회 권한)	서버 전용
`ANTHROPIC_API_KEY`	LLM 호출	서버 전용
수동 설정 체크리스트
[ ] Supabase 프로젝트 생성 → URL/anon/service_role 키를 `.env.local`에 입력
[ ] DB 마이그레이션 적용(생성된 SQL 실행: `profiles`, `promotions` 테이블 + enum + RLS)
[ ] Storage 버킷 생성: `assets`, `thumbnails`, `exports` (정책 설정 포함)
[ ] Google OAuth: Google Cloud Console에서 OAuth 클라이언트 발급 → Supabase Auth Providers에 Client ID/Secret 등록 → Redirect URL 등록 (이 단계 없으면 SCR-01 구글 로그인 동작 불가)
[ ] Anthropic API 키 발급 → `.env.local`에 입력
[ ] (배포 시) 동일 환경변수를 호스팅 플랫폼(Vercel 등)에 등록
> Claude Code는 위 항목에 대응하는 **SQL 마이그레이션 파일·RLS 정책·`.env.example`·설정 README**를 생성하되, 외부 콘솔에서의 실제 키 발급/등록은 사용자가 수행합니다.
---
Part 1. 기획서
1. 서비스 개요
Promo.ai 는 기획·디자인·개발 지식 없이도 마케터가 5단계 위저드만으로 프로모션 원페이지를 완성하는 노코드 빌더입니다.
한 줄 정의: "아이디어부터 완성까지, 프로모션을 만드는 가장 쉬운 방법"
핵심 가치: ① 목적 기반 자동 추천(레이아웃/디자인) ② AI 카피 자동 생성 ③ 컴포넌트 조립식 편집 ④ 즉시 결과물(프리뷰/이미지/HTML)
타겟 사용자: 브랜드/리테일 마케터, 캠페인 담당자, 1인 운영자
권한: 일반 멤버(member) / 관리자(admin · `master`). 관리자는 `DB Debug` 등 운영 도구 접근
2. 핵심 사용자 플로우
```
[로그인/회원가입] 
      │  (이메일·비번 / Google OAuth)
      ▼
[대시보드: 모든 프로모션]  ──(검색·정렬·아카이브)
      │  "새 프로모션 +"
      ▼
┌──────────────── 5단계 생성 위저드 ────────────────┐
│ 1 정보 입력 → 2 목적 선택 → 3 프로토타입 선택      │
│   → 4 컴포넌트 수정 → 5 콘텐츠 입력                │
│   (단계별 [이전]/[다음], 4·5단계는 [저장] 가능)     │
└───────────────────────────────────────────────────┘
      │  "생성하기"
      ▼
[결과물: 프리뷰 + PNG 저장 + HTML export]
      │
      ▼
[대시보드로 복귀 — 카드로 노출(상태배지: 초안/진행중/완료)]
```
3. 화면 목록 (IA)
ID	화면	비고	근거 이미지
SCR-01	로그인 / 회원가입 / 찾기	비로그인 진입점	00_login
SCR-02	대시보드(모든 프로모션)	카드 그리드, 검색·정렬·아카이브	01_main, Campaign_Management
SCR-03	위저드 Step1 — 프로모션 정보 입력	이름/브랜드/담당자	02_CreatuserDB(+populated)
SCR-04	위저드 Step2 — 프로모션 목적 선택	대분류+세부 라디오	03_Selectpurpose(+done)
SCR-05	위저드 Step3 — 프로토타입 선택	이벤트/가격/제품 강조	04_Selectprototype(+done)
SCR-06	위저드 Step4 — 컴포넌트 수정	3패널(목록·변형·프리뷰), DnD	05_Componentmodification
SCR-07	위저드 Step5 — 콘텐츠 입력	필드 입력 + AI채우기 + 생성하기	06_coninput(+v2)
SCR-08	아카이브	보관함(소프트 삭제 목록)	(사이드바 메뉴)
4. 기술 스택 & 아키텍처
```
Next.js (App Router)
├─ /app
│   ├─ (auth)/login                     SCR-01
│   ├─ (app)/dashboard                  SCR-02
│   ├─ (app)/archive                    SCR-08
│   └─ (app)/builder/[promotionId]/
│        ├─ step-1 ~ step-5             SCR-03~07
│        └─ result                      결과물
├─ /app/api
│   ├─ ai/fill          → LLM 카피 생성 (서버)
│   ├─ ai/generate      → 결과물 산출/요약 (서버)
│   └─ export/html      → HTML 직렬화 (서버, 선택)
├─ /components          공통 UI + 프로모션 렌더 컴포넌트(variant)
├─ /lib/supabase        client/server 클라이언트
├─ /lib/ai              LLM 추상화 레이어
└─ /store               Zustand 위저드 스토어
```
인증: Supabase Auth(이메일+비번, Google OAuth). 미들웨어로 `(app)` 보호.
데이터: Supabase Postgres. RLS로 `owner_id = auth.uid()` 행 단위 보안.
파일: Supabase Storage 버킷 `assets`(업로드 이미지), `thumbnails`(썸네일), `exports`(HTML).
LLM 키는 서버에서만. 클라이언트는 `/api/ai/*` 호출.
5. 데이터 모델 (Supabase / Postgres)
> MVP는 레이아웃을 `promotions.layout`(JSONB)으로 보관해 단순화. 필요 시 정규화 분리.
profiles
컬럼	타입	설명
id	uuid PK	`auth.users.id` 참조
name	text	표시 이름(예: master)
role	text enum(`member`,`admin`)	기본 `member`
avatar_url	text	프로필 이미지
created_at	timestamptz	
promotions
컬럼	타입	설명
id	uuid PK	
owner_id	uuid FK→profiles	RLS 기준
name	text	프로모션 이름 (Step1)
brand_name	text	브랜드 이름 (Step1)
manager_name	text	담당자 이름 (Step1)
purpose_main	text enum(`revenue`,`engagement`)	매출증진/고객참여 (Step2)
purpose_detail	text enum(`repurchase`,`new_product`,`discount`,`collab`)	세부 목적 (Step2)
prototype_type	text enum(`event`,`price`,`product`)	이벤트/가격/제품 강조 (Step3)
status	text enum(`draft`,`in_progress`,`done`)	초안/진행중/완료
current_step	int (1~5)	마지막 작업 단계
layout	jsonb	섹션 배열(아래 구조)
thumbnail_url	text	카드 썸네일
export_html_url	text	export 결과
archived	bool default false	아카이브 여부
created_at / updated_at	timestamptz	
`layout` JSONB 구조
```jsonc
{
  "sections": [
    {
      "id": "sec_kv_01",
      "zone": "top",                 // top | middle | bottom
      "fixed": true,                 // top=true(위치 고정), middle/bottom=false
      "componentType": "KV",         // 컴포넌트 카탈로그 키
      "variantId": "KV#t3",          // 선택한 변형
      "order": 0,
      "content": {                   // 컴포넌트 필드 스키마에 따른 값
        "headline": "",
        "description": "",
        "textButton": "",
        "solidButton": "",
        "image": "",
        "validFrom": "2026-01-01",
        "validTo": "2026-02-28"
      }
    }
  ]
}
```
RLS(요지)
`select/insert/update/delete`: `owner_id = auth.uid()`
`admin` 역할은 전체 조회 허용(운영 도구용, 선택)
6. 디자인 시스템 토큰
> 정확한 HEX는 디자인에서 추출. 아래는 화면 기준 근사치.
```css
--color-primary:        #6C5CE7;  /* 메인 보라 (버튼/액티브 스텝/배지) */
--color-primary-weak:   #EFEBFF;  /* 선택 카드 배경 틴트 */
--color-primary-strong: #2E1A6B;  /* 로그인 그라데이션 딥 인디고 */
--color-bg:             #F4F4F5;  /* 빌더/대시보드 배경 */
--color-surface:        #FFFFFF;  /* 카드/패널 */
--color-border:         #E5E5E8;
--color-text:           #1A1A1A;
--color-text-sub:       #8A8A8E;  /* placeholder/보조 */
--status-progress:      #2BBE6B;  /* 진행중 (초록) */
--status-done:          #6C5CE7;  /* 완료 (보라) */
--status-draft:         #9AA0A6;  /* 초안 (회색) */
--radius-card:          16px;
--radius-input:         12px;
--radius-pill:          9999px;   /* 다음/생성하기 버튼 */
--font: 'Pretendard', system-ui, sans-serif;
```
상태 배지 매핑: `진행중`=초록, `완료`=보라, `초안`=회색.
---
Part 2. 기능명세서
공통 규칙 (모든 위저드 화면)
상단 스텝퍼: `1 프로모션 정보 입력 › 2 프로모션 목적 선택 › 3 프로토타입 선택 › 4 컴포넌트 수정 › 5 콘텐츠 입력`. 현재=보라 채움, 완료=보라, 미래=회색. 우측에 프로필 아바타.
좌측 입력 패널 / 우측 미리보기 패널(Step1~3은 예시 갤러리, Step4~5는 실시간 프리뷰).
하단/상단 내비: `[이전]`(아웃라인 pill), `[다음]`(보라 pill). 필수 조건 미충족 시 `[다음]` 비활성(회색).
저장: Step4·5 상단에 `저장` 노출 → 현재 `layout`/입력값을 promotions에 upsert. 위저드 진입 시 자동 저장(autosave, 디바운스 1.5s)도 권장.
단계 이동 시 입력값은 Zustand 스토어 + Supabase에 보존(새로고침/이탈 후 복귀 가능).
검증 실패 토스트/인라인 메시지는 한국어.
---
SCR-01 · 로그인 / 회원가입 / 찾기
레이아웃: 좌(50%) 브랜드 패널 + 우(50%) 폼. 모바일은 폼 단독(브랜드 패널 상단 축소).
좌측 브랜드 패널
로고 `Promo.ai`(좌상단)
헤드라인: "아이디어부터 완성까지," / "프로모션을 만드는 가장 쉬운 방법"(둘째 줄 밑줄 강조)
서브: "브랜딩·캠페인·콘텐츠까지 한 곳에서 완성하세요."
보라 그라데이션 + 추상 3D 비주얼(정적 이미지 에셋)
우측 폼
제목: "안녕하세요 :)" / "Promo.ai 입니다."
서브: "프로모션 페이지 제작을 지금 프로모에서 시작하세요!"
입력: 이메일(placeholder "이메일을 입력해주세요.") / 비밀번호(placeholder "비밀번호를 입력해주세요.")
`[로그인]`(보라, full-width)
보조 링크: `아이디 찾기` · `비밀번호 찾기` · `회원가입`
구분선 "또는"
`[Google로 계속하기]`(흰 버튼 + 구글 로고)
동작/규칙
로그인: Supabase `signInWithPassword`. 실패 시 인라인 에러("이메일 또는 비밀번호가 올바르지 않습니다.").
Google: Supabase OAuth(`provider: google`). 성공 시 `profiles` 없으면 자동 생성.
회원가입: 이메일/비번/이름 → `signUp`. 이메일 형식·비번 최소 8자 검증.
비밀번호 찾기: 재설정 메일 발송(`resetPasswordForEmail`).
로그인 성공 → `/dashboard`. 이미 로그인 상태로 `/login` 접근 시 대시보드 리다이렉트.
---
SCR-02 · 대시보드 (모든 프로모션)
상단 바: 로고 / 중앙 검색창("검색어를 입력해주세요.") / 우측 영역 — (관리자 한정)`DB Debug` 버튼 · `새 프로모션 +`(보라) · 프로필(아바타+이름+역할 "관리자", 드롭다운).
좌측 사이드바: 라벨 `프로젝트` → `모든 프로모션`(문서 아이콘, 기본 선택) · `아카이브`(휴지통 아이콘).
본문
제목 `모든 프로모션`
정렬 드롭다운 `최신순 ▾`(최신순/오래된순/이름순 등)
카드 그리드(반응형: 모바일1·태블릿2·데스크톱3열). 카드 구성:
썸네일(렌더된 프로모션 미리보기 이미지)
제목(예: "여름 시즌 프로모션")
상태 배지(`진행중`/`완료`/`초안`)
메타: `브랜드 · 담당자 · 목적`(예: 삼성전자 · 김철수 · 매출증진)
수정 시각("1일전 수정" 또는 "2025. 11. 26. 수정")
동작/규칙
카드 클릭 → 해당 프로모션 빌더로 진입(`current_step`로 복귀) 또는 결과물 보기(`done`).
카드 hover 시 더보기(⋯) → 수정/복제/아카이브/삭제.
검색: name/brand/manager 텍스트 필터(클라이언트 또는 Supabase `ilike`).
정렬: `updated_at`/`created_at`/`name` 기준.
`새 프로모션 +` → 빈 promotions 행(status=`draft`, step=1) 생성 후 Step1 진입.
아카이브 메뉴 → `archived=true` 목록(SCR-08).
빈 상태: 카드 없을 때 "첫 프로모션을 만들어 보세요" 안내 + CTA.
---
SCR-03 · Step1 · 프로모션 정보 입력
좌측 폼
제목 "프로모션 정보 입력" / 서브 "프로모션 생성에 필요한 기본 정보를 입력해주세요."
필드 ①: 라벨 "프로모션 정보 입력"(= 프로모션 이름), placeholder "프로모션의 이름을 작성해주세요." → `promotions.name`
필드 ②: 라벨 "브랜드 이름", placeholder "프로모션이 활용 될 브랜드 이름을 작성해주세요." → `brand_name`
필드 ③: 라벨 "담당자 이름", placeholder "프로모션 담당자의 이름을 작성해주세요." → `manager_name`
`[이전]`(대시보드로) / `[다음]`
우측: 다양한 프로모션 디자인 예시 갤러리(정적) + 카피 "Promo.ai는 고객의 프로모션 목적에 최적화된 다양한 디자인을 제공합니다. 복잡한 기획 없이도 목적에 맞는 프로모션을 빠르게 제작할 수 있습니다."
검증: 3개 필드 모두 비어있지 않으면 `[다음]` 활성. (이미지: 빈 상태=다음 회색 / 입력 완료=다음 보라)
---
SCR-04 · Step2 · 프로모션 목적 선택
좌측
제목 "프로모션 목적 선택" / 서브 "가장 적합한 목적을 선택해주세요."
그룹 A "프로모션의 목적을 선택해주세요" — 라디오(단일): `매출증진`(revenue) · `고객 참여 활성화`(engagement)
그룹 B "디테일한 목적을 선택해주세요" — 라디오(단일): `재구매 / 구독유도`(repurchase) · `신제품 홍보`(new_product) · `할인 프로모션`(discount) · `제휴 / 콜라보레이션`(collab)
선택된 항목: 보라 테두리 + 라디오 채움 + 연보라 배경.
`[이전]` / `[다음]`
우측: 미리보기 카드 2종 — `매출증진`(총 매출 3,103,256,000원 / 작년대비 22% 상승 그래프) · `고객 참여 활성화`(구독자 98,060,512명 / 10% mo/mo / Newsletter). 카피 "Promo.ai는 사용자의 목표를 분석해 가장 효과적인 프로모션 유형과 디자인을 제안합니다. 누구나 손쉽게 고품질 프로모션을 제작할 수 있습니다."
검증: 그룹 A·B 각각 1개씩 선택 시 `[다음]` 활성.
비고: 목적 선택 결과는 Step3 프로토타입 추천 정렬과 Step5 AI 카피 톤에 반영(권장).
---
SCR-05 · Step3 · 프로토타입 선택
좌측
제목 "프로토타입 선택" / 서브 "프로토타입을 선택해주세요. / 최적화된 레이아웃과 디자인을 추천합니다."
선택 리스트(아이콘+제목+설명, 단일 선택):
`이벤트 강조`(event) — "이벤트 기간과 참여 방법을 명확하게 전달하는 레이아웃입니다."
`가격 강조`(price) — "할인가와 혜택을 전면에 배치하여 경쟁력을 강조한 레이아웃입니다."
`제품 강조`(product) — "제품 이미지와 스펙을 중심으로 제품의 가치를 부각하는 레이아웃입니다."
선택 시 보라 테두리 강조.
`[이전]` / `[다음]`
우측: 미리보기 카드 3종 — `SNS 참여 이벤트` · `가격 강조` · `제품 강조`. 카피 "Promo.ai는 SNS 참여·가격 강조·제품 강조의 3가지 유형을 제공해 목적에 맞는 프로모션을 쉽고 빠르게 만들 수 있습니다."
동작: 프로토타입 선택 시 Step4 초기 `layout`(기본 섹션 구성/변형)이 해당 타입 프리셋으로 세팅(부록 F 참조). `[다음]` = 1개 선택 시 활성.
---
SCR-06 · Step4 · 컴포넌트 수정 (핵심 화면)
상단 바(확장형): 스텝퍼 + 프로필 + `저장` + `[이전]` + `[다음]`.
3패널 구조
① 좌측 — 컴포넌트 목록 패널
제목 "컴포넌트 수정" + ⓘ 아이콘 → 툴팁 "프로모션 구성 팁: ・두번째 패널에서 종류와 옵션을 설정해요. ・Fixed 섹션은 위치가 고정됩니다 ・Adjustable 섹션은 자유롭게 배치 가능합니다"
존(zone)별 그룹 (`(n)` = 사용 가능한 변형 개수):
존	속성	컴포넌트(변형 수)
Top	`* 고정`	GNB/LNB (10), KV (12)
Middle	`* 조절 가능`	Contents card (15), Product card (12), KV Tab Container (8), Video (5), RTB (8)
Bottom	`* 조절 가능`	FAQ (7), Disclaimer (4)
각 행 우측 `›`(chevron) → 클릭 시 ② 변형 패널 오픈.
② 중앙 — 변형(Variant) 선택 패널
선택한 컴포넌트의 변형 갤러리(예: GNB 여러 헤더 레이아웃, LNB 여러 형태) 세로 나열.
상단 닫기 `✕`.
변형 클릭 → 해당 섹션의 `variantId` 갱신 → ③ 프리뷰 즉시 반영.
③ 우측 — 실시간 프리뷰 패널
조립된 프로모션 페이지 렌더(GNB, KV[선택 시 파란 테두리+`KV` 배지], Product card 캐러셀, Tab, Product grid 등).
선택된 섹션에 플로팅 컨트롤: `▲`(위로) `▼`(아래로) `✕`(삭제). 캐러셀 좌우 화살표.
동작/규칙
Top(고정): 위치 이동 불가(항상 최상단/순서 고정), 변형 교체만 가능.
Middle/Bottom(조절 가능): `@dnd-kit`으로 순서 재배치, 추가/삭제 가능. `order`/`zone` 갱신.
섹션 추가: 좌측 목록에서 컴포넌트 선택 → 해당 zone에 append.
모든 변경은 `layout` JSONB에 반영, `저장`/autosave로 영속화.
`[다음]` = 최소 구성(예: GNB+KV 존재) 충족 시 활성.
---
SCR-07 · Step5 · 콘텐츠 입력
상단 바: 스텝퍼 + 프로필 + `저장` + `[이전]` + `[생성하기]`(보라).
좌측 — 입력 패널
제목 "콘텐츠 입력" / 서브 "콘텐츠의 내용을 입력해서 프로모션을 완성하세요."
우상단 `[✨ AI로 채우기]`(보라 틴트) — v2 화면에 존재.
선택된 섹션 단위로 필드 그룹 렌더(예: `KV#t3`):
`Headline Text` — input "텍스트를 입력해주세요." → `content.headline`
`Description Text` — textarea "텍스트를 입력해주세요." → `content.description`
`Text Button` — input "버튼명을 입력해주세요." → `content.textButton`
`Solid Button` — input "버튼명을 입력해주세요." → `content.solidButton`
`Image` — 파일 업로드 "이미지 파일을 추가해주세요." (v2) → Storage 업로드 후 `content.image`
필드 구성은 컴포넌트 필드 스키마(부록 A)에 따라 동적 생성.
우측 — 실시간 프리뷰: 편집 중 섹션 강조(파란 테두리 + `KV#t3` 배지). 입력 변경이 프리뷰에 즉시 반영(controlled binding).
동작/규칙
우측 프리뷰에서 섹션 클릭 → 좌측이 해당 섹션 필드로 스크롤/포커스(양방향 연동).
`AI로 채우기` → 아래 AI 명세 참조.
`생성하기` → 결과물 산출(아래 명세).
---
SCR-08 · 아카이브
대시보드와 동일 그리드, `archived=true` 목록.
카드 메뉴: `복원`(archived=false) / `영구 삭제`(확인 모달).
---
부록 A · 컴포넌트 카탈로그 & 필드 스키마
각 컴포넌트는 `componentType` 키 · 변형 개수 · 입력 필드 스키마를 가집니다. 변형 수는 화면의 `(n)` 표기 기준.
componentType	zone(기본)	fixed	변형 수	주요 입력 필드
`GNB_LNB`	top	✔	10	logo, menuItems[], searchEnabled, cart/userIcon
`KV`	top	✔	12	headline, description, textButton, solidButton, image, validFrom, validTo, label
`ContentsCard`	middle	✖	15	title, description, image, link
`ProductCard`	middle	✖	12	productName, description, price, image, badge
`KVTabContainer`	middle	✖	8	tabs[]{label, items[]}
`Video`	middle	✖	5	videoUrl/file, poster, autoplay
`RTB`	middle	✖	8	reasonItems[]{icon, title, desc}
`FAQ`	bottom	✖	7	items[]{question, answer}
`Disclaimer`	bottom	✖	4	text(다회선), validity, notice
> 변형(variantId) 명명 예: `KV#t3`, `GNB#02`. 각 변형은 동일 필드 스키마를 공유하되 레이아웃/스타일만 상이하도록 구현(콘텐츠 호환).
---
부록 B · AI 기능 명세
B-1. `AI로 채우기` (`POST /api/ai/fill`)
입력 컨텍스트: `name, brand_name, purpose_main, purpose_detail, prototype_type, 대상 섹션 componentType/variantId, 필드 스키마`.
출력: 해당 섹션 필드(headline/description/button 등)에 맞는 한국어 카피 JSON. 예:
```json
  { "headline": "...", "description": "...", "textButton": "더 알아보기", "solidButton": "지금 구매" }
  ```
동작: 응답값을 좌측 입력 필드에 채움(사용자 수정 가능). 생성 중 로딩/스켈레톤, 실패 시 토스트 + 재시도.
프롬프트 가이드: 목적(매출/참여)·세부목적·프로토타입 톤을 반영, 길이 제약(headline ≤ N자 등) 준수, JSON만 반환 지시.
보안: LLM 키는 서버 라우트에서만. 클라이언트 미노출. 사용량/rate limit 고려.
B-2. `생성하기` (`POST /api/ai/generate` + export 파이프라인)
입력 검증(필수 콘텐츠 채움 여부) → 미충족 필드 하이라이트.
(선택) AI로 누락 카피 보완/요약 메타 생성.
`layout` 확정 → 프로모션 최종 렌더.
결과물 3종 산출:
프리뷰: 결과 페이지 표시.
이미지(PNG): 프리뷰 DOM을 `html-to-image`로 캡처 → 다운로드 + Storage `thumbnails` 저장(대시보드 카드용).
HTML export: 정적 HTML 직렬화 → `.html` 다운로드 + Storage `exports` 저장, `export_html_url` 기록.
⚠️ Tailwind는 빌드 타임 컴파일이라 DOM만 직렬화하면 스타일이 빠짐. 다음 중 하나로 처리:
(권장) 서버 라우트에서 프로모션을 렌더 → 사용된 CSS를 인라인 `<style>`로 임베드한 자기완결 HTML 생성.
또는 export 전용 컴포넌트에 인라인 스타일/CSS-in-JS 사용.
또는 결과 HTML에 Tailwind CDN + safelist 포함(빠른 MVP용, 정밀도 낮음).
`status` 갱신(`draft`→`in_progress`/`done`), 대시보드 복귀.
---
부록 C · 권한 / 역할
기능	member	admin(`master`)
본인 프로모션 CRUD	✔	✔
타인 프로모션 조회	✖	✔(운영)
`DB Debug` 도구	✖	✔
---
부록 D · 비기능 요구사항
반응형: 로그인·대시보드는 모바일~데스크톱 대응. 빌더(Step4·5 3패널)는 데스크톱 우선(최소 1280px). 작은 화면은 패널 접기/안내.
자동저장: 위저드 입력 디바운스 저장 + 명시적 `저장`.
로딩/에러 상태: 모든 비동기(인증/AI/저장/업로드)에 로딩·에러·재시도 처리.
접근성: 라디오/입력 라벨 연결, 키보드 포커스, 대비.
국제화: 한국어 고정(추후 i18n 확장 가능 구조).
성능: 프리뷰 렌더 메모이즈, 이미지 lazy load.
---
Part 3. 개발 마일스톤 (바이브 코딩 권장 순서)
부트스트랩: Next.js + TS + Tailwind + Supabase 연결 + 디자인 토큰/공통 UI(버튼·인풋·뱃지·스텝퍼).
인증(SCR-01): 이메일/비번 + Google OAuth + 라우트 보호 + `profiles` 생성.
데이터 계층: promotions/profiles 테이블 + RLS + Storage 버킷, CRUD 훅.
대시보드(SCR-02)/아카이브(SCR-08): 카드 그리드·검색·정렬·상태배지·새 프로모션 생성.
위저드 셸: 스텝퍼·이전/다음·저장·Zustand 스토어·autosave·복귀 로직.
Step1~3(SCR-03~05): 폼/라디오/프로토타입 선택 + 검증 + 예시 갤러리.
컴포넌트 렌더 라이브러리: componentType별 변형 컴포넌트(최소 1~2 변형부터) + 필드 스키마.
Step4(SCR-06): 3패널 + 변형 선택 + dnd-kit 재배치 + 프리뷰 동기화.
Step5(SCR-07): 동적 필드 입력 + 양방향 프리뷰 연동 + 이미지 업로드.
AI 연동: `/api/ai/fill`, `/api/ai/generate` + 프롬프트 튜닝.
결과물: PNG 캡처 + HTML export + 썸네일/상태 반영 + 대시보드 복귀.
마감: 반응형·접근성·에러처리·빈 상태·관리자 도구(DB Debug).
---
부록 F · 프로토타입 초기 레이아웃 프리셋
> Step3에서 프로토타입 선택 시 Step4로 넘어갈 때 세팅되는 **초기 `layout.sections`**. 사용자는 이후 변형 교체·추가·재배치로 수정 가능. `variantId`는 예시이며 부록 A 범위 내에서 1개 기본값을 사용.
프로토타입	강조 의도	초기 섹션 구성(순서)
`event` (이벤트 강조)	기간·참여방법 명확 전달	GNB_LNB(top) → KV(top) → KVTabContainer(mid) → ContentsCard(mid) → FAQ(bottom) → Disclaimer(bottom)
`price` (가격 강조)	할인가·혜택 전면	GNB_LNB(top) → KV(top) → ProductCard(mid) → RTB(mid) → ContentsCard(mid) → Disclaimer(bottom)
`product` (제품 강조)	제품 이미지·스펙 부각	GNB_LNB(top) → KV(top) → Video(mid) → ProductCard(mid) → RTB(mid) → FAQ(bottom) → Disclaimer(bottom)
공통: Top 존(GNB_LNB, KV)은 항상 포함·고정. Middle/Bottom은 위 순서로 생성하되 `fixed:false`.
목적(Step2)도 참고 신호로 활용 가능(예: `engagement`+`event` → KVTabContainer 가중). MVP는 위 표대로 단순 적용.
---

상태 전이 규칙: `초안→진행중→완료` 자동 전이 기준(예: 생성하기=완료?) 정확 정의 필요.
변형 수(n) 전부 구현 vs 대표 일부: MVP는 컴포넌트별 1~2 변형부터, 이후 확장 권장.
`DB Debug` 범위: 단순 데이터 점검 뷰인지, 시드/리셋 기능 포함인지.
회원가입 필드: 이름 외 추가 정보(회사/약관 동의 등) 필요 여부.
HTML export 정밀도: 픽셀퍼펙트 정적 HTML vs 단순 마크업+토큰 CSS 수준.
AI 카피 길이/톤 가이드: 컴포넌트별 글자수 상한·금칙어 등 세부 정책.
> 위 항목들은 기본값으로 진행 가능하며, 우선순위 높은 항목만 별도로 정해주셔도 됩니다.
