import { useState, useRef, useEffect } from 'react';
import type { Todo, Category, Priority } from '../../types';
import { CATEGORIES, PRIORITIES, CATEGORY_COLORS, PRIORITY_COLORS } from '../../types';
import { getDdayText, getDdayColor, formatDate } from '../../utils/dateUtils';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'due_date'>>) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editCategory, setEditCategory] = useState<Category>(todo.category);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? formatDate(todo.due_date) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(todo.id, {
      text: editText.trim(),
      category: editCategory,
      priority: editPriority,
      due_date: editDueDate ? new Date(editDueDate).getTime() : null,
    });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditText(todo.text);
    }
  };

  const priorityEmoji = todo.priority === '높음' ? '🔴' : todo.priority === '보통' ? '🟡' : '🟢';

  return (
    <div
      className={`todo-item ${todo.completed ? 'todo-completed' : ''}`}
      style={{ borderLeftColor: PRIORITY_COLORS[todo.priority] }}
    >
      <div className="todo-item-main">
        <input
          type="checkbox"
          className="todo-checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />

        {editing ? (
          <div className="todo-edit-form">
            <input
              ref={inputRef}
              type="text"
              className="todo-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="todo-edit-options">
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
              <button className="btn btn-sm btn-primary" onClick={handleSave}>저장</button>
              <button className="btn btn-sm btn-outline" onClick={() => { setEditing(false); setEditText(todo.text); }}>취소</button>
            </div>
          </div>
        ) : (
          <div className="todo-content" onDoubleClick={() => setEditing(true)}>
            <span className="todo-text">{todo.text}</span>
            <div className="todo-badges">
              <span
                className="badge badge-category"
                style={{ backgroundColor: CATEGORY_COLORS[todo.category] }}
              >
                {todo.category}
              </span>
              <span className="badge badge-priority">{priorityEmoji} {todo.priority}</span>
              {todo.due_date && (
                <span className={`badge badge-dday ${getDdayColor(todo.due_date)}`}>
                  {getDdayText(todo.due_date)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <div className="todo-actions">
          <button className="btn btn-icon btn-edit" onClick={() => setEditing(true)} title="수정">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="btn btn-icon btn-delete" onClick={() => onDelete(todo.id)} title="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
