import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Theme } from '../types';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(userId: string | null) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || getSystemTheme();
  });

  // OS 다크모드 감지
  useEffect(() => {
    if (userId) return; // 로그인 시 DB 값 사용
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [userId]);

  // 로그인 시 DB에서 테마 로드
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_profiles')
      .select('theme')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.theme) {
          setTheme(data.theme as Theme);
          localStorage.setItem('theme', data.theme);
        }
      });
  }, [userId]);

  // 테마 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);

    if (userId) {
      await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, theme: next }, { onConflict: 'user_id' });
    }
  }, [theme, userId]);

  return { theme, toggleTheme };
}
