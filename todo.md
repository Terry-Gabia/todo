Todo App

React + TypeScript + Supabase+ 필요시 nestjs 로 만든 할일 관리 앱을 만들어야함
필요한 계정이나 키값은 나에게 물어보고 만들어봐


인증 (Authentication)

* 이메일/비밀번호 로그인 및 회원가입
* Google OAuth 로그인 (리디렉션 방식)
* 세션 자동 유지 (새로고침해도 로그인 상태 보존)
* 오류 메시지 한국어 번역
 할일 관리 (CRUD)

* 추가: 내용, 카테고리, 중요도, 마감일 설정 후 Enter 또는 버튼 클릭
* 완료 토글: 체크박스 클릭으로 완료/미완료 전환
* 인라인 수정: 내용, 카테고리, 중요도, 마감일 수정
* 삭제: × 버튼으로 항목 삭제
* 낙관적 업데이트(Optimistic Update)로 빠른 UI 반응
  카테고리

개인 / 업무 / 쇼핑 / 회의 / 기타로 분류하고 색상 배지로 구분합니다.
중요도

높음 / 보통 / 낮음 3단계로 설정합니다.
* 카드 왼쪽 테두리 색상으로 한눈에 구분
* 색상 배지(🔴 🟡 🟢)로 추가 표시
 마감일 (D-Day)

* 할일 추가 시 마감일 선택 가능 (선택사항)
* D-Day 배지로 남은 일수 표시
    * D-3 이상: 회색
    * D-1 ~ D-2: 주황색 (임박)
    * D-Day: 빨간색
    * 기한 초과: 진한 빨강 배경 (D+N)
필터 & 통계
버튼	설명
전체	모든 할일 표시
오늘 마감	오늘이 마감인 항목만 표시
개인 / 업무 / 쇼핑 / 회의 / 기타	카테고리별 필터
	•	각 필터 버튼에 항목 수 배지 표시
* 완료 개수 + 진행률 프로그레스 바
테마 (다크/라이트 모드)

* 라이트 ↔ 다크 모드 토글 버튼
* 로그인 전/후 모두 사용 가능 (우측 상단 고정 버튼)
* 로그인 상태: 선택한 테마를 DB에 저장 (기기 간 동기화)
* 비로그인 상태: localStorage에 저장 + OS 다크모드 자동 감지
텔레그램 봇 연동 (양방향)

웹 → 텔레그램 (푸시 알림)

* 할일 추가 시 텔레그램 알림 발송
* 할일 완료 처리 시 텔레그램 알림 발송
* 할일 삭제 시 텔레그램 알림 발송
* 유저별 Chat ID 설정으로 개인 알림 수신
텔레그램 → 웹 (봇 명령)

명령	설명
일반 텍스트 입력	자동으로 할일 추가
/목록 또는 /list	미완료 할일 목록 조회
/완료 [번호] 또는 /done [번호]	번호로 할일 완료 처리
/내아이디 또는 /myid	내 Chat ID 확인
  
알림 설정 방법

1. 텔레그램에서 봇을 열고 /내아이디 입력
2. 앱의 텔레그램 알림 설정 패널에서 Chat ID 저장
실시간 동기화 (Supabase Realtime)

* 텔레그램 봇으로 추가/수정/삭제된 항목이 웹에 즉시 반영
* 중복 방지 처리 (낙관적 업데이트와 Realtime 이벤트 충돌 방지)
기술 스택
항목	내용
프레임워크	React 18
언어	TypeScript 5
빌드 도구	Vite 5
스타일	순수 CSS (CSS 변수로 테마 구현)
백엔드/DB	Supabase (Auth + PostgreSQL + Realtime)
알림	Telegram Bot API
환경변수 설정

.env 파일을 프로젝트 루트에 생성하고 아래 값을 입력하세요.
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# 텔레그램 봇 (서버 사이드 전용)
TELEGRAM_BOT_TOKEN=봇_토큰
SUPABASE_SERVICE_ROLE_KEY=서비스_롤_키

실행 방법

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

프로젝트 구조는 알아서 잡아봐

DB 스키마 (Supabase)
-- 할일 테이블
todos (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES auth.users,
  text        text,
  completed   boolean,
  category    text,     -- '개인' | '업무' | '쇼핑' | '회의' | '기타'
  priority    text,     -- '높음' | '보통' | '낮음'
  due_date    bigint,   -- 마감일 타임스탬프 (밀리초, nullable)
  created_at  bigint    -- 생성 시각 타임스탬프 (밀리초)
)

-- 유저 프로필 테이블
user_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users,
  theme            text,   -- 'light' | 'dark'
  telegram_chat_id text    -- 텔레그램 Chat ID (nullable)
)
  필요한거 있으면 나에게 물어보고 만들어봐

React + TypeScript + Supabase+ 필요시 nests 로 만든 할일 관리 앱을 만들어야함


인증 (Authentication)

* 이메일/비밀번호 로그인 및 회원가입
* Google OAuth 로그인 (리디렉션 방식)
* 세션 자동 유지 (새로고침해도 로그인 상태 보존)
* 오류 메시지 한국어 번역
 할일 관리 (CRUD)

* 추가: 내용, 카테고리, 중요도, 마감일 설정 후 Enter 또는 버튼 클릭
* 완료 토글: 체크박스 클릭으로 완료/미완료 전환
* 인라인 수정: 내용, 카테고리, 중요도, 마감일 수정
* 삭제: × 버튼으로 항목 삭제
* 낙관적 업데이트(Optimistic Update)로 빠른 UI 반응
  카테고리

개인 / 업무 / 쇼핑 / 회의 / 기타로 분류하고 색상 배지로 구분합니다.
중요도

높음 / 보통 / 낮음 3단계로 설정합니다.
* 카드 왼쪽 테두리 색상으로 한눈에 구분
* 색상 배지(🔴 🟡 🟢)로 추가 표시
 마감일 (D-Day)

* 할일 추가 시 마감일 선택 가능 (선택사항)
* D-Day 배지로 남은 일수 표시
    * D-3 이상: 회색
    * D-1 ~ D-2: 주황색 (임박)
    * D-Day: 빨간색
    * 기한 초과: 진한 빨강 배경 (D+N)
필터 & 통계
버튼	설명
전체	모든 할일 표시
오늘 마감	오늘이 마감인 항목만 표시
개인 / 업무 / 쇼핑 / 회의 / 기타	카테고리별 필터
	•	각 필터 버튼에 항목 수 배지 표시
* 완료 개수 + 진행률 프로그레스 바
테마 (다크/라이트 모드)

* 라이트 ↔ 다크 모드 토글 버튼
* 로그인 전/후 모두 사용 가능 (우측 상단 고정 버튼)
* 로그인 상태: 선택한 테마를 DB에 저장 (기기 간 동기화)
* 비로그인 상태: localStorage에 저장 + OS 다크모드 자동 감지
텔레그램 봇 연동 (양방향)

웹 → 텔레그램 (푸시 알림)

* 할일 추가 시 텔레그램 알림 발송
* 할일 완료 처리 시 텔레그램 알림 발송
* 할일 삭제 시 텔레그램 알림 발송
* 유저별 Chat ID 설정으로 개인 알림 수신
텔레그램 → 웹 (봇 명령)

명령	설명
일반 텍스트 입력	자동으로 할일 추가
/목록 또는 /list	미완료 할일 목록 조회
/완료 [번호] 또는 /done [번호]	번호로 할일 완료 처리
/내아이디 또는 /myid	내 Chat ID 확인
  
알림 설정 방법

1. 텔레그램에서 봇을 열고 /내아이디 입력
2. 앱의 텔레그램 알림 설정 패널에서 Chat ID 저장
실시간 동기화 (Supabase Realtime)

* 텔레그램 봇으로 추가/수정/삭제된 항목이 웹에 즉시 반영
* 중복 방지 처리 (낙관적 업데이트와 Realtime 이벤트 충돌 방지)
기술 스택
항목	내용
프레임워크	React 18
언어	TypeScript 5
빌드 도구	Vite 5
스타일	순수 CSS (CSS 변수로 테마 구현)
백엔드/DB	Supabase (Auth + PostgreSQL + Realtime)
알림	Telegram Bot API
환경변수 설정

.env 파일을 프로젝트 루트에 생성하고 아래 값을 입력하세요.
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# 텔레그램 봇 (서버 사이드 전용)
TELEGRAM_BOT_TOKEN=봇_토큰
SUPABASE_SERVICE_ROLE_KEY=서비스_롤_키

실행 방법

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

프로젝트 구조는 알아서 잡아봐

DB 스키마 (Supabase)
-- 할일 테이블
todos (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES auth.users,
  text        text,
  completed   boolean,
  category    text,     -- '개인' | '업무' | '쇼핑' | '회의' | '기타'
  priority    text,     -- '높음' | '보통' | '낮음'
  due_date    bigint,   -- 마감일 타임스탬프 (밀리초, nullable)
  created_at  bigint    -- 생성 시각 타임스탬프 (밀리초)
)

-- 유저 프로필 테이블
user_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users,
  theme            text,   -- 'light' | 'dark'
  telegram_chat_id text    -- 텔레그램 Chat ID (nullable)
)
필요한거 있으면 나에게 물어보고 만들어봐


구글 인증 참고사항

clinetid : 159709957350-69c0cnkqo9kto93ntuhag1ccrbe266b4.apps.googleusercontent.com
clinet secret 159709957350-69c0cnkqo9kto93ntuhag1ccrbe266b4.apps.googleusercontent.com
https://dvynnouphxkreipjrnws.supabase.co/auth/v1/callback