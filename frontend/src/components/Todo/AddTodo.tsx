import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { CATEGORIES, PRIORITIES, type Category, type Priority } from '../../types';

interface Props {
  onAdd: (text: string, category: Category, priority: Priority, dueDate: number | null) => void;
}

export function AddTodo({ onAdd }: Props) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('개인');
  const [priority, setPriority] = useState<Priority>('보통');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    const dueDateMs = dueDate ? new Date(dueDate).getTime() : null;
    onAdd(text.trim(), category, priority, dueDateMs);
    setText('');
    setDueDate('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="add-todo" onSubmit={handleSubmit}>
      <div className="add-todo-row">
        <input
          type="text"
          className="add-todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할일을 입력하세요..."
        />
        <button type="submit" className="btn btn-primary btn-add" disabled={!text.trim()}>
          추가
        </button>
      </div>
      <div className="add-todo-options">
        <select
          className="select-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="select-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
    </form>
  );
}
