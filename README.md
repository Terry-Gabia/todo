# Todo App

React + NestJS + Supabase 기반 할일 관리 앱입니다.
텔레그램 봇과 양방향 연동되며, Supabase Realtime으로 실시간 동기화됩니다.

**Live**: https://todo-mocha-psi.vercel.app/

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                          사용자                                      │
│                     ┌────────┴────────┐                              │
│                     ▼                 ▼                              │
│              웹 브라우저          텔레그램 앱                          │
│                     │                 │                              │
│                     ▼                 ▼                              │
│  ┌──────────────────────┐  ┌──────────────────────┐                 │
│  │   Frontend (Vercel)  │  │  Backend (Railway)   │                 │
│  │   React 19 + Vite 7  │  │  NestJS + Bot API    │                 │
│  │                      │  │                      │                 │
│  │  • Todo CRUD         │  │  • 텔레그램 봇 폴링   │                 │
│  │  • Google OAuth      │  │  • 명령어 처리        │                 │
│  │  • 테마 토글          │  │  • 알림 발송          │                 │
│  │  • Realtime 구독      │  │  • Realtime 구독      │                 │
│  └──────────┬───────────┘  └──────────┬───────────┘                 │
│             │                         │                              │
│             ▼                         ▼                              │
│  ┌──────────────────────────────────────────────┐                   │
│  │              Supabase                         │                   │
│  │                                               │                   │
│  │  ┌───────────┐ ┌──────────┐ ┌─────────────┐  │                   │
│  │  │ PostgreSQL│ │   Auth   │ │  Realtime    │  │                   │
│  │  │ (todos,   │ │ (Email + │ │ (WebSocket  │  │                   │
│  │  │ profiles) │ │  Google) │ │  변경 감지)  │  │                   │
│  │  └───────────┘ └──────────┘ └─────────────┘  │                   │
│  └──────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
[웹에서 할일 추가]
  → Supabase DB INSERT
  → Realtime 이벤트 발생
  → Backend가 감지 → 텔레그램 알림 발송

[텔레그램에서 할일 추가]
  → Backend가 봇 메시지 수신
  → Supabase DB INSERT (Service Role)
  → Realtime 이벤트 발생
  → Frontend가 감지 → UI 자동 업데이트
```

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **프론트엔드** | React 19, TypeScript 5, Vite 7 |
| **백엔드** | NestJS 11, TypeScript 5 |
| **데이터베이스** | Supabase (PostgreSQL) |
| **인증** | Supabase Auth (이메일 + Google OAuth) |
| **실시간** | Supabase Realtime (WebSocket) |
| **알림** | Telegram Bot API (node-telegram-bot-api) |
| **스타일** | 순수 CSS (CSS Variables 테마) |
| **배포** | Vercel (프론트), Railway (백엔드) |
| **런타임** | Node.js v20.19.1 (fnm) |

---

## 프로젝트 구조

```
todo/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── main.tsx             # 엔트리 포인트
│   │   ├── App.tsx              # 메인 앱 컴포넌트
│   │   ├── components/
│   │   │   ├── Auth/Auth.tsx           # 로그인/회원가입
│   │   │   ├── Layout/Header.tsx       # 헤더 (유저 정보, 로그아웃)
│   │   │   ├── Layout/ThemeToggle.tsx  # 다크/라이트 토글
│   │   │   ├── Todo/TodoList.tsx       # 할일 목록 컨테이너
│   │   │   ├── Todo/TodoItem.tsx       # 할일 카드
│   │   │   ├── Todo/AddTodo.tsx        # 할일 추가 폼
│   │   │   ├── Todo/Filters.tsx        # 필터 & 통계
│   │   │   └── Telegram/TelegramSettings.tsx  # 텔레그램 설정
│   │   ├── hooks/
│   │   │   ├── useAuth.ts       # 인증 상태 관리
│   │   │   ├── useTodos.ts      # Todo CRUD + Realtime
│   │   │   └── useTheme.ts      # 테마 상태 관리
│   │   ├── lib/supabase.ts      # Supabase 클라이언트
│   │   ├── types/index.ts       # TypeScript 타입 정의
│   │   ├── utils/
│   │   │   ├── dateUtils.ts     # D-Day 계산
│   │   │   └── errorMessages.ts # 에러 메시지 한국어 번역
│   │   └── styles/index.css     # 전역 CSS + 테마 변수
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                     # NestJS 백엔드 (텔레그램 봇)
│   ├── src/
│   │   ├── main.ts              # 앱 부트스트랩
│   │   ├── app.module.ts        # 루트 모듈
│   │   ├── config/supabase.ts   # Supabase Admin 클라이언트
│   │   └── telegram/
│   │       ├── telegram.module.ts       # 텔레그램 모듈
│   │       ├── telegram.service.ts      # 봇 명령 처리
│   │       └── notification.service.ts  # Realtime 알림 발송
│   ├── tsconfig.json
│   └── package.json
│
├── supabase-schema.sql          # DB 스키마 (테이블, RLS, 인덱스)
├── todo.md                      # 프로젝트 기획 문서
└── README.md                    # 이 파일
```

---

## 외부 서비스 설정 가이드

이 프로젝트를 처음부터 세팅하려면 아래 5개 서비스를 순서대로 설정합니다.

### 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에서 새 저장소 생성
2. 로컬에서 연결:
   ```bash
   git init
   git remote add origin https://github.com/<username>/<repo>.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

### 2. Supabase 프로젝트 생성

Supabase는 DB, 인증, 실시간 기능을 모두 제공합니다.

1. [Supabase](https://supabase.com)에 로그인 후 **New Project** 클릭
2. 프로젝트 이름과 DB 비밀번호 설정 후 생성
3. 생성 완료 후 **Project Settings > API**에서 다음 값을 복사:
   - **Project URL** → `SUPABASE_URL`
   - **anon (public) key** → `VITE_SUPABASE_ANON_KEY` (프론트엔드용)
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (백엔드용, 절대 노출 금지)

4. **SQL Editor**에서 `supabase-schema.sql` 내용을 실행하여 테이블 생성:
   - `todos` 테이블 (할일 데이터)
   - `user_profiles` 테이블 (테마, 텔레그램 설정)
   - RLS 정책 (유저별 데이터 격리)
   - Realtime 활성화

5. **Database > Replication**에서 `todos` 테이블의 Realtime이 활성화되어 있는지 확인

### 3. Google OAuth 설정

Google 로그인을 위해 Google Cloud Console과 Supabase 양쪽을 설정합니다.

#### 3-1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스 > OAuth 동의 화면** 설정:
   - 사용자 유형: **외부** 선택
   - 앱 이름, 이메일 등 기본 정보 입력
   - 범위(Scopes): `email`, `profile`, `openid` 추가
   - 테스트 사용자에 본인 이메일 추가 (개발 단계)
4. **API 및 서비스 > 사용자 인증 정보 > OAuth 2.0 클라이언트 ID** 만들기:
   - 애플리케이션 유형: **웹 애플리케이션**
   - 승인된 리디렉션 URI에 추가:
     ```
     https://<your-project>.supabase.co/auth/v1/callback
     ```
   - 생성 후 **클라이언트 ID**와 **클라이언트 시크릿**을 복사

#### 3-2. Supabase에서 Google Provider 활성화

1. Supabase 대시보드 > **Authentication > Providers**
2. **Google** 클릭하여 활성화
3. 위에서 복사한 **Client ID**와 **Client Secret** 입력
4. **Redirect URL**이 Google Console에 등록한 것과 동일한지 확인:
   ```
   https://<your-project>.supabase.co/auth/v1/callback
   ```
5. 저장

> **참고**: Supabase가 자동으로 OAuth 흐름을 처리합니다.
> 프론트엔드에서는 `supabase.auth.signInWithOAuth({ provider: 'google' })`만 호출하면 됩니다.

### 4. Telegram Bot 생성

텔레그램 봇으로 할일 추가/조회/완료 및 실시간 알림을 받을 수 있습니다.

1. 텔레그램에서 [@BotFather](https://t.me/BotFather)를 검색하여 대화 시작
2. `/newbot` 명령 입력
3. 봇 이름과 사용자명(username) 지정 (username은 `_bot`으로 끝나야 함)
4. 생성 완료 후 **Bot Token**을 복사 → `TELEGRAM_BOT_TOKEN`

#### 봇 명령어 등록 (선택사항)

BotFather에서 `/setcommands`를 입력하고 다음 명령어를 등록하면 사용자에게 자동완성이 제공됩니다:

```
myid - 내 Chat ID 확인
list - 미완료 할일 목록
done - 할일 완료 처리 (예: /done 1)
```

#### 사용자별 알림 연동 방법

```
1. 텔레그램에서 생성한 봇과 대화 시작
2. /내아이디 또는 /myid 입력 → 봇이 Chat ID를 알려줌
3. 웹 앱에서 헤더의 "텔레그램 알림 설정" 클릭
4. 복사한 Chat ID 입력 후 저장
5. 이후 할일 추가/완료/삭제 시 텔레그램 알림 수신
```

#### 지원 명령어

| 명령 | 설명 |
|------|------|
| 일반 텍스트 입력 | 자동으로 할일 추가 |
| `/목록` 또는 `/list` | 미완료 할일 목록 조회 |
| `/완료 [번호]` 또는 `/done [번호]` | 번호로 할일 완료 처리 |
| `/내아이디` 또는 `/myid` | 내 Chat ID 확인 |

### 5. Vercel 배포 (프론트엔드)

1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. **Add New Project** → GitHub 저장소 Import
3. 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** 추가:
   | 변수명 | 값 |
   |--------|-----|
   | `VITE_SUPABASE_URL` | Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
5. **Deploy** 클릭

> 이후 `main` 브랜치에 push하면 자동 배포됩니다.

#### Supabase Redirect URL 업데이트

Vercel 배포 후 실제 도메인이 확정되면:

1. Supabase 대시보드 > **Authentication > URL Configuration**
2. **Site URL**에 Vercel 배포 URL 입력:
   ```
   https://your-app.vercel.app
   ```
3. **Redirect URLs**에도 추가:
   ```
   https://your-app.vercel.app/**
   ```

### 6. Railway 배포 (백엔드)

1. [Railway](https://railway.app)에 GitHub 계정으로 로그인
2. **New Project** → **Deploy from GitHub repo** → 저장소 선택
3. 설정:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. **Variables** 탭에서 환경변수 추가:
   | 변수명 | 값 |
   |--------|-----|
   | `SUPABASE_URL` | Supabase Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
   | `TELEGRAM_BOT_TOKEN` | BotFather에서 받은 토큰 |
   | `PORT` | `3001` |
5. Deploy 후 24시간 자동 실행

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Node.js v20.19.1 이상 ([fnm](https://github.com/Schniz/fnm) 권장)
- npm

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/Terry-Gabia/todo.git
cd todo

# 2. 프론트엔드 설정
cd frontend
npm install

# .env 파일 생성
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
EOF

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 3. 백엔드 설정 (새 터미널)
cd ../backend
npm install

# .env 파일 생성
cat > .env << 'EOF'
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
TELEGRAM_BOT_TOKEN=<your-bot-token>
PORT=3001
EOF

# 개발 서버 실행 (http://localhost:3001)
npm run start:dev
```

### 환경 변수 요약

#### Frontend (`frontend/.env`)

| 변수 | 설명 | 발급처 |
|------|------|--------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase 공개(anon) 키 | Supabase > Settings > API |

#### Backend (`backend/.env`)

| 변수 | 설명 | 발급처 |
|------|------|--------|
| `SUPABASE_URL` | Supabase 프로젝트 URL | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 (RLS 우회) | Supabase > Settings > API |
| `TELEGRAM_BOT_TOKEN` | 텔레그램 봇 토큰 | [@BotFather](https://t.me/BotFather) |
| `PORT` | 백엔드 서버 포트 | 기본값: `3001` |

---

## 주요 기능

### 할일 관리 (CRUD)
- **추가**: 내용 + 카테고리 + 중요도 + 마감일(선택) 입력 후 Enter
- **완료 토글**: 체크박스로 완료/미완료 전환
- **인라인 수정**: 더블클릭으로 내용, 카테고리, 중요도, 마감일 수정
- **삭제**: × 버튼 클릭
- **낙관적 업데이트**: UI가 즉시 반응, 실패 시 자동 롤백

### 카테고리 & 중요도
- **카테고리**: 개인 / 업무 / 쇼핑 / 회의 / 기타 (색상 배지)
- **중요도**: 높음(🔴) / 보통(🟡) / 낮음(🟢) (카드 좌측 테두리 색상)

### 마감일 (D-Day)
| 상태 | 색상 |
|------|------|
| D-3 이상 남음 | 회색 |
| D-1 ~ D-2 | 주황색 (임박) |
| D-Day | 빨간색 |
| 기한 초과 (D+N) | 진한 빨강 |

### 필터 & 통계
- 전체 / 오늘 마감 / 카테고리별 필터
- 각 필터 버튼에 항목 수 배지
- 완료 진행률 프로그레스 바

### 테마
- 라이트 / 다크 모드 토글 (우측 상단)
- 로그인 시: DB에 저장 (기기 간 동기화)
- 비로그인 시: localStorage + OS 다크모드 감지

### 실시간 동기화
- Supabase Realtime으로 웹 ↔ 텔레그램 양방향 동기화
- 낙관적 업데이트와 Realtime 이벤트 중복 방지 처리

---

## DB 스키마

```sql
-- 할일 테이블
CREATE TABLE todos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        text NOT NULL,
  completed   boolean NOT NULL DEFAULT false,
  category    text NOT NULL DEFAULT '기타'
              CHECK (category IN ('개인', '업무', '쇼핑', '회의', '기타')),
  priority    text NOT NULL DEFAULT '보통'
              CHECK (priority IN ('높음', '보통', '낮음')),
  due_date    bigint,          -- 마감일 (밀리초 타임스탬프, nullable)
  created_at  bigint NOT NULL  -- 생성 시각 (밀리초 타임스탬프)
);

-- 유저 프로필 테이블
CREATE TABLE user_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme            text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  telegram_chat_id text           -- 텔레그램 Chat ID (nullable)
);
```

- **RLS (Row Level Security)** 활성화: 유저는 자신의 데이터만 접근 가능
- **Realtime**: `todos` 테이블 변경 시 WebSocket으로 즉시 전파
- **Service Role**: 백엔드(텔레그램 봇)는 Service Role 키로 RLS 우회

전체 스키마는 [`supabase-schema.sql`](./supabase-schema.sql) 참고.

---

## 배포 현황

| 서비스 | 플랫폼 | URL |
|--------|--------|-----|
| 프론트엔드 | Vercel | https://todo-mocha-psi.vercel.app/ |
| 백엔드 | Railway | 24시간 자동 실행 (텔레그램 봇 폴링) |
| 저장소 | GitHub | https://github.com/Terry-Gabia/todo |
| 데이터베이스 | Supabase | PostgreSQL + Auth + Realtime |
