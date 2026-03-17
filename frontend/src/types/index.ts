export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  due_date: number | null;
  created_at: number;
}

export type Category = '개인' | '업무' | '쇼핑' | '회의' | '기타';
export type Priority = '높음' | '보통' | '낮음';
export type Theme = 'light' | 'dark';
export type FilterType = '전체' | '오늘 마감' | Category;

export interface UserProfile {
  user_id: string;
  theme: Theme;
  telegram_chat_id: string | null;
}

export const CATEGORIES: Category[] = ['개인', '업무', '쇼핑', '회의', '기타'];
export const PRIORITIES: Priority[] = ['높음', '보통', '낮음'];

export const CATEGORY_COLORS: Record<Category, string> = {
  '개인': '#6366f1',
  '업무': '#3b82f6',
  '쇼핑': '#f59e0b',
  '회의': '#10b981',
  '기타': '#8b5cf6',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  '높음': '#ef4444',
  '보통': '#f59e0b',
  '낮음': '#22c55e',
};
