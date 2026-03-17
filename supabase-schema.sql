-- =============================================
-- 할일 관리 앱 - Supabase 데이터베이스 스키마
-- =============================================

-- 1. 할일 테이블
CREATE TABLE IF NOT EXISTS public.todos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        text NOT NULL,
  completed   boolean NOT NULL DEFAULT false,
  category    text NOT NULL DEFAULT '기타' CHECK (category IN ('개인', '업무', '쇼핑', '회의', '기타')),
  priority    text NOT NULL DEFAULT '보통' CHECK (priority IN ('높음', '보통', '낮음')),
  due_date    bigint,          -- 마감일 타임스탬프 (밀리초, nullable)
  created_at  bigint NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::bigint
);

-- 2. 유저 프로필 테이블
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme            text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  telegram_chat_id text
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_chat_id ON public.user_profiles(telegram_chat_id);

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 - todos
CREATE POLICY "Users can view own todos" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- 6. RLS 정책 - user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;

-- 8. Service Role용 RLS 우회 정책 (텔레그램 봇 서버용)
-- Service Role Key를 사용하면 RLS가 자동 우회됩니다 (별도 정책 불필요)
