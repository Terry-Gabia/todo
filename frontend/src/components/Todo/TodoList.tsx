import { useState, useMemo } from 'react';
import type { Todo, FilterType, Category } from '../../types';
import { CATEGORIES } from '../../types';
import { isToday } from '../../utils/dateUtils';
import { TodoItem } from './TodoItem';
import { AddTodo } from './AddTodo';
import { Filters } from './Filters';
import type { Priority } from '../../types';

interface Props {
  todos: Todo[];
  loading: boolean;
  onAdd: (text: string, category: Category, priority: Priority, dueDate: number | null) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'due_date'>>) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, loading, onAdd, onToggle, onUpdate, onDelete }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');

  const filteredTodos = useMemo(() => {
    if (activeFilter === '전체') return todos;
    if (activeFilter === '오늘 마감') return todos.filter((t) => t.due_date && isToday(t.due_date));
    if (CATEGORIES.includes(activeFilter as Category)) {
      return todos.filter((t) => t.category === activeFilter);
    }
    return todos;
  }, [todos, activeFilter]);

  return (
    <div className="todo-list-container">
      <AddTodo onAdd={onAdd} />
      <Filters todos={todos} activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-state">
          {activeFilter === '전체'
            ? '할일이 없습니다. 새 할일을 추가해보세요!'
            : `'${activeFilter}' 필터에 해당하는 할일이 없습니다.`}
        </div>
      ) : (
        <div className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
