import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Todo, Category, Priority } from '../types';

export function useTodos(userId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const optimisticIds = useRef<Set<string>>(new Set());

  // 할일 목록 로드
  const fetchTodos = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTodos(data as Todo[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Realtime 구독
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('todos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTodo = payload.new as Todo;
            if (optimisticIds.current.has(newTodo.id)) {
              optimisticIds.current.delete(newTodo.id);
              return; // 낙관적 업데이트로 이미 추가된 항목
            }
            setTodos((prev) => [newTodo, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Todo;
            setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setTodos((prev) => prev.filter((t) => t.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // 추가
  const addTodo = useCallback(
    async (text: string, category: Category, priority: Priority, dueDate: number | null) => {
      if (!userId) return;
      const id = crypto.randomUUID();
      const newTodo: Todo = {
        id,
        user_id: userId,
        text,
        completed: false,
        category,
        priority,
        due_date: dueDate,
        created_at: Date.now(),
      };

      // 낙관적 업데이트
      optimisticIds.current.add(id);
      setTodos((prev) => [newTodo, ...prev]);

      const { error } = await supabase.from('todos').insert(newTodo);
      if (error) {
        optimisticIds.current.delete(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [userId]
  );

  // 완료 토글
  const toggleTodo = useCallback(async (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);
    if (error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t))
      );
    }
  }, [todos]);

  // 수정
  const updateTodo = useCallback(
    async (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'due_date'>>) => {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
      const { error } = await supabase.from('todos').update(updates).eq('id', id);
      if (error) {
        fetchTodos(); // 실패 시 전체 새로고침
      }
    },
    [fetchTodos]
  );

  // 삭제
  const deleteTodo = useCallback(async (id: string) => {
    const prev = todos;
    setTodos((current) => current.filter((t) => t.id !== id));
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      setTodos(prev);
    }
  }, [todos]);

  return { todos, loading, addTodo, toggleTodo, updateTodo, deleteTodo };
}
