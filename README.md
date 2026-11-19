<div align="center">

# 📝 Next.js Todo

**Supabase 인증 기반 회원 전용 Todo 리스트**

기존 React Todo 리스트를 Next.js App Router 환경으로 마이그레이션하고,<br/>
Supabase Auth · Database를 연동해 고도화한 프로젝트입니다.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)

🔗 **배포 주소**: [https://ax-frontend-react-next-js-practice.vercel.app](https://ax-frontend-react-next-js-todo-7fot.vercel.app/)

</div>

---

## 📌 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [라우팅 구조](#-라우팅-구조)
- [렌더링 전략](#-렌더링-전략)
- [시작하기](#-시작하기)
- [과제 요구사항별 구현 내용](#-과제-요구사항별-구현-내용)
- [진행 현황 & 남은 작업](#-진행-현황--남은-작업)

---

## ✨ 주요 기능

| 기능 | 설명 |
| --- | --- |
| 🔐 **회원가입 / 로그인 / 로그아웃** | Supabase Auth 이메일·비밀번호 인증, `profiles` 테이블 연동 |
| 🛡️ **회원 전용 접근 제어** | Proxy(`proxy.ts`, 구 Middleware)에서 세션을 검증해 미인증 사용자를 `/sign_in?redirectUrl=...`로 리다이렉트 |
| ✅ **할 일 등록** | `useActionState` + Server Action, Tiptap 리치 텍스트 에디터, 필드별 유효성 검사 |
| 🔄 **상태 변경** | 준비중 → 진행중 → 완료, `useOptimistic`으로 즉시 반영 후 실패 시 자동 롤백 |
| 🔍 **상세 보기** | 동적 라우트 `/todo/[id]/view`, 없는 할 일은 `notFound()` 처리 |
| ✏️ **수정 / 🗑️ 삭제** | 등록 폼을 Props로 재사용한 수정 화면, 확인 창 후 soft delete |
| ⏳ **상태별 UI** | `loading.tsx`(스켈레톤), `error.tsx`(다시 시도), `EmptyState`(빈 목록 안내) |
| ⭐ **찜하기** | Zustand persist 스토어로 찜 목록 관리 (`/todo/pin`) |
| 🐰 **Bunny Post 리디자인** | 동화 속 마을(하늘·들판·집·빨간 우체통) + 구름 위 할 일 카드 + 토끼 배달원. 등록 시 배달 애니메이션, 3일 이내 긴급 모드(신문 뿌리기·토스트), 정확히 10일 남으면 침대에서 휴식, 랜덤 대화, 완료 축하 + 별 스티커/모자 |
| 🥕 **당근 & 다람 잡화점** | 할 일을 처음 완료하면 당근 지급 (기본 100 · 마감 전 완료 +50 · 오늘의 첫 완료 +100, 같은 할 일은 한 번만). `/shop`에서 모자 · 마을 소품 · 편지지 구매 → 토끼 모자, 들판 소품, 할 일 카드 무늬에 바로 반영. 매일 바뀌는 오늘의 특가(30%), 별 스티커로 받는 선물 모자. 당근 지급 · 구매는 Supabase DB 함수가 검사 |
| 👫 **친구 & 놀러가기** | `/friends`에서 가입 이메일로 친구 찾기 → 신청 → 수락. `/village/[userId]`에서 친구 마을(토끼 모자 · 소품 · 편지지) 구경, 할 일은 내용 없이 봉인된 편지 개수로만 공개. 방명록 남기기 · 지우기 |

---

## 🛠 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| BaaS | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| State | React Hooks (`useState`, `useEffect`, `useCallback`, `useOptimistic`, `useActionState`, `useTransition`, 커스텀 훅), Zustand, Immer |
| Styling | Tailwind CSS 4, shadcn/ui, lucide-react, react-icons |
| Editor | Tiptap |
| Deploy | Vercel |

---

## 📂 프로젝트 구조

도메인(기능) 단위로 코드를 나누고, 여러 도메인이 함께 쓰는 코드는 `shared/`에 모았습니다.

```
├── app/
│   ├── layout.tsx                 # 루트 레이아웃
│   └── (todo)/                    # 라우트 그룹 (공통 Header 레이아웃)
│       ├── page.tsx               # 할 일 목록 (메인)
│       ├── sign_in/               # 로그인
│       ├── sign_up/               # 회원가입
│       ├── loading.tsx            # 로딩 UI (스켈레톤)
│       ├── error.tsx              # 오류 UI (다시 시도)
│       └── todo/
│           ├── new/               # 할 일 등록
│           ├── pin/               # 찜 목록
│           └── [id]/              # 동적 라우트
│               ├── view/          # 할 일 상세
│               ├── edit/          # 할 일 수정
│               └── not-found.tsx  # 없는 할 일
│
├── domains/
│   ├── auth/
│   │   ├── actions/               # 로그인·회원가입·로그아웃 Server Actions
│   │   ├── components/            # SignInForm, SignUpForm, SignOutButton
│   │   ├── queries/               # getCurrentUser (React cache 적용)
│   │   ├── types/
│   │   └── utils/                 # 입력값 유효성 검사
│   └── todo/
│       ├── actions/               # 등록·수정·삭제·상태 변경 Server Actions
│       ├── components/            # TodoDashBoard, TodoItems, TodoForm, TodoDetail, DeleteTodoButton ...
│       ├── constants/             # 상태 이름표 (서버·클라이언트 공용)
│       ├── hooks/                 # usePinnedTodos (useEffect 커스텀 훅)
│       ├── queries/               # getTodos, getTodoById
│       ├── stores/                # usePinStore (Zustand)
│       ├── types/
│       └── utils/                 # DB 응답 변환, 유효성 검사
│
├── shared/
│   ├── components/                # Header, EmptyState, TiptapEditor, ui(shadcn)
│   ├── lib/                       # Supabase 클라이언트, 세션 미들웨어
│   └── types/                     # 공통 ActionState 타입
│
└── proxy.ts                       # 인증 세션 갱신 및 접근 제어 (Next.js 16의 Middleware)
```

---

## 🧭 라우팅 구조

| 경로 | 페이지 | 접근 권한 |
| --- | --- | --- |
| `/` | 할 일 목록 | 🔒 회원 |
| `/todo/new` | 할 일 등록 | 🔒 회원 |
| `/todo/pin` | 찜 목록 | 🔒 회원 |
| `/todo/[id]/view` | 할 일 상세 (수정·삭제 버튼) | 🔒 회원 |
| `/todo/[id]/edit` | 할 일 수정 | 🔒 회원 |
| `/sign_in` | 로그인 | 🔓 비회원 (로그인 상태면 `/`로 이동) |
| `/sign_up` | 회원가입 | 🔓 비회원 (로그인 상태면 `/`로 이동) |

---

## ⚡ 렌더링 전략

| 컴포넌트 | 종류 | 선택 이유 |
| --- | --- | --- |
| `app/(todo)/page.tsx` | 🖥️ Server | 서버에서 Supabase로 할 일 목록을 조회해 초기 HTML에 포함 → 첫 화면 로딩이 빠르고 클라이언트 번들이 줄어듦 |
| `Header` | 🖥️ Server | 쿠키 기반 세션을 서버에서 읽어 로그인 상태에 맞는 UI를 바로 렌더링 |
| `TodoDashBoard`, `TodoItems` | 💻 Client | 상태 변경 클릭, 낙관적 업데이트(`useOptimistic`) 등 사용자 상호작용 담당 |
| `TodoForm`, `SignInForm`, `SignUpForm` | 💻 Client | 입력값 제어, `useActionState`로 Server Action 결과(오류 메시지) 표시 |
| `/todo/[id]/view`, `TodoDetail` | 🖥️ Server | `params`의 id로 서버에서 조회 → 완성된 HTML 전송. id가 필요한 부분만 `<Suspense>`로 감싸 껍데기는 즉시 표시 |
| `TodoContentViewer`, `DeleteTodoButton` | 💻 Client | Tiptap(브라우저 전용) 표시, 삭제 확인 창·진행 상태 등 상호작용만 클라이언트로 분리 |
| `/todo/pin` | 💻 Client | 찜한 id는 브라우저 저장소에만 있어 서버가 알 수 없음 → 브라우저에서 id를 읽은 뒤 `usePinnedTodos`(`useEffect`)로 Supabase에서 최신 정보 조회 |

**데이터 흐름**

- **조회**: 서버 컴포넌트에서 데이터를 가져와 클라이언트 컴포넌트에 `initialItems` Props로 전달
- **변경**: Server Action으로 처리 후 `revalidatePath`로 화면 갱신
- **클라이언트 조회**: 찜 목록은 커스텀 훅 `usePinnedTodos`에서 `useEffect`로 조회
  - 의존성 배열에는 배열 대신 문자열 키(`idsKey`)를 넣어 id 목록이 실제로 바뀔 때만 재요청
  - 클린업 함수에서 `AbortController`로 이전 요청을 취소해 늦게 도착한 응답이 화면을 덮어쓰지 않도록 처리
  - 로딩 / 성공 / 오류 / 빈 데이터 4가지 상태를 반환하고, `retry`로 다시 시도
- **인증**: `getCurrentUser`를 React `cache`로 감싸 한 요청 안에서 여러 번 호출해도 Supabase 조회는 한 번만 수행

---

## 🚀 시작하기

### 1. 설치

```bash
git clone https://github.com/yeji-jang/AX_frontend_React_Next.js_practice.git
cd AX_frontend_React_Next.js_practice
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 Supabase 프로젝트 정보를 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. DB 준비 (마을 · 친구 기능)

Supabase 대시보드 → **SQL Editor**에서 [`supabase/migrations/20261118_village_friends.sql`](supabase/migrations/20261118_village_friends.sql) 내용을 붙여넣고 실행합니다.
당근 · 잡화점 · 친구 · 방명록 테이블과 DB 함수가 만들어져요. (여러 번 실행해도 안전합니다)

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 🎯 과제 요구사항별 구현 내용

| 요구사항 | 구현 내용 | 관련 파일 |
| --- | --- | --- |
| **컴포넌트 분리 & Props** | 기능 단위 분리(`TodoDashBoard` → `TodoItems` → `TodoItem`), 모든 Props에 `interface` 타입 지정. 재사용 컴포넌트: `EmptyState`(목록·찜·404에서 재사용), `TodoForm`(`todo` Props 유무로 등록/수정 겸용) | `domains/todo/components/`, `shared/components/EmptyState.tsx` |
| **Hook & 비동기 처리** | `useState`·`useEffect`·`useCallback`·`useTransition`·`useOptimistic`·`useActionState`. 커스텀 훅 `usePinnedTodos`는 의존성 배열에 문자열 키 사용, 클린업에서 `AbortController`로 요청 취소. Props를 State에 복사하지 않아 상태 꼬임 방지 | `domains/todo/hooks/usePinnedTodos.ts`, `TodoDashBoard.tsx`, `TodoForm.tsx` |
| **상태별 UI (조건부·목록 렌더링)** | 로딩(`loading.tsx`, `Suspense` 스켈레톤), 오류(`error.tsx` + 다시 시도), 빈 데이터(`EmptyState`), 성공(`map` + 고유 `id`/`status` key) | `app/(todo)/loading.tsx`, `app/(todo)/error.tsx`, `todo/pin/page.tsx` |
| **라우팅** | 파일 기반 라우팅 + 라우트 그룹 `(todo)`, 동적 라우트 `/todo/[id]/view`, `/todo/[id]/edit`. `params`(Promise) 처리, 없는 id는 `notFound()`, 삭제 후 `router.replace`로 뒤로 가기 방지, 로그인 후 `redirectUrl`로 원래 페이지 복귀 | `app/(todo)/todo/[id]/`, `proxy.ts` |
| **서버/클라이언트 구분 & 데이터 연동** | 조회는 서버 컴포넌트(빠른 첫 화면, 번들 감소), 상호작용만 클라이언트로 분리. 변경은 Server Action + `revalidatePath`. 브라우저에만 있는 데이터(찜 id)는 클라이언트에서 `useEffect`로 조회 → [렌더링 전략](#-렌더링-전략) 참고 | `domains/*/actions/`, `domains/*/queries/` |
| **인증 & 회원 전용 화면** | Supabase Auth(이메일·비밀번호), `proxy.ts`에서 세션 검증 후 미인증 사용자 리다이렉트, 모든 쿼리·액션에서 `user_id`로 본인 데이터만 접근 | `domains/auth/`, `shared/lib/supabaseMiddleware.ts` |

---

## 📋 진행 현황 & 남은 작업

### ✅ 완료

- [x] Next.js App Router 기반 프로젝트 구조 구성 (도메인별 폴더 분리)
- [x] Supabase 클라이언트 설정 (서버용 / 브라우저용)
- [x] 회원가입 · 로그인 · 로그아웃 (Server Actions + 유효성 검사)
- [x] Proxy(구 Middleware) 기반 회원 전용 페이지 접근 제어
- [x] Next.js 16 규칙에 맞춰 `middleware.ts` → `proxy.ts` 변경
- [x] 로그인 시 탈퇴 회원 검사 버그 수정 (`deletedAt` → `deleted_at`)
- [x] 할 일 목록 조회 (서버 컴포넌트 → Props 전달)
- [x] 할 일 등록 (Tiptap 에디터, 필드별 오류 메시지)
- [x] 할 일 상태 변경 (낙관적 업데이트 + 실패 시 롤백)
- [x] 찜하기 / 찜 목록 (Zustand)
- [x] 찜 목록 최신 정보 조회: 커스텀 훅 `usePinnedTodos` (`useEffect` + 클린업 + 상태별 UI)

### 🔥 필수

- [x] **할 일 상세 페이지 구현** (`/todo/[id]/view`)
  - [x] `params`(Promise)에서 `id`를 받아 `getTodoById`로 조회, `<Suspense>`로 로딩 처리
  - [x] 존재하지 않는 id는 `notFound()` → `[id]/not-found.tsx` 표시
  - [x] 내용은 Tiptap 읽기 전용 뷰어(`TodoContentViewer`)로 안전하게 표시
- [x] **상태별 UI 처리**
  - [x] 로딩: `loading.tsx` 추가 (스켈레톤 UI)
  - [x] 오류: `error.tsx` 추가, 조회 실패 시 빈 배열 대신 오류를 던지도록 `getTodos` 수정
  - [x] 빈 데이터: 재사용 컴포넌트 `EmptyState`로 안내 문구 표시 (메인 목록, 찜 목록)
- [x] **할 일 수정 · 삭제 기능** (상세 페이지에서 처리)
  - [x] 삭제: `deleteTodoAction`(soft delete, `deleted_at` 기록) + 확인 창 + 찜 목록에서도 제거
  - [x] 수정: `/todo/[id]/edit` + `updateTodoAction`, 등록 폼(`TodoForm`)을 `todo` Props로 재사용

### 🚀 배포

- [x] Vercel에 GitHub 저장소 연결
- [x] Vercel 환경 변수 등록 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- [x] Supabase Auth의 Site URL / Redirect URL에 배포 주소 추가
- [x] README 상단에 배포 주소 추가

### 🧹 정리

- [x] Header의 "로고로 채워주세요." 문구를 실제 로고(홈 링크)로 교체
- [x] 사용하지 않는 중복 파일 삭제 (`shared/lib/cn.ts`)
- [x] `npm run build`로 경고 확인 (Next 16의 `middleware.ts` → `proxy.ts` 변경 완료)
- [x] `TodoDashBoard`에서 Props를 `useState`에 복사하던 코드 제거 → `useOptimistic(initialItems)` + `revalidatePath`로 서버 데이터와 동기화
- [x] 조회 함수(`getTodos`, `getTodoById`)의 불필요한 `'use server'` 제거 (Server Action에만 사용)
- [x] `tsc`, `eslint`, `next build` 모두 오류·경고 0개

### 🐰 Bunny Post 리디자인

- [x] 마감일 입력 (등록/수정 폼, 브라우저 저장 `useDueDateStore` — DB 구조는 그대로)
- [x] 정렬: 마감 가까운 순 → 생성일 순 → 마감일 없음은 뒤, 완료는 "완료 보관함"으로 분리 (`utils/todoPriority.ts`)
- [x] 토끼 상태 통합 (`hooks/useBunnyState.ts`): celebrating > delivering > urgent > talking > sleeping > idle, 배달 중에는 다른 상태로 전환하지 않음
- [x] 배달: DB 저장 성공 후에만 대기열에 추가 → 우체통에서 등장 → 편지를 구름 카드로 (Motion `layoutId`)
- [x] 긴급(0~3일·지남): 집 주변을 뛰며 신문 뿌리기 1회, 토스트 1회, 카드 코랄 강조
- [x] 휴식(정확히 10일, 긴급 없을 때): 집 침실 창문 안 침대 + Zzz
- [x] 랜덤 대화(25초 후 첫 방문, 1~2분 간격, 조작 중엔 미룸) + 토끼 클릭 시 대화
- [x] 완료: 카드가 떠오르며 별 반짝 → 토끼 점프 → 별 스티커 +1 (실패 시 축하 취소 + 카드 복구)
- [x] 추가: 우체통 위 편지 쌓임, 별 스티커로 모자 변경, 시간대별 하늘(아침/낮/저녁/밤)
- [x] 로딩·오류·빈 화면, 로그인/회원가입/상세/수정/찜 페이지 테마 적용, `prefers-reduced-motion` 지원
