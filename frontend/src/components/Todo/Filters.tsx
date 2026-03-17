import type { Todo, FilterType } from '../../types';
import { CATEGORIES } from '../../types';
import { isToday } from '../../utils/dateUtils';

interface Props {
  todos: Todo[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: FilterType[] = ['전체', '오늘 마감', ...CATEGORIES];

export function Filters({ todos, activeFilter, onFilterChange }: Props) {
  const getCount = (filter: FilterType): number => {
    if (filter === '전체') return todos.length;
    if (filter === '오늘 마감') return todos.filter((t) => t.due_date && isToday(t.due_date)).length;
    return todos.filter((t) => t.category === filter).length;
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="filters-section">
      <div className="filters">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`btn btn-filter ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
            <span className="filter-count">{getCount(filter)}</span>
          </button>
        ))}
      </div>
      <div className="stats">
        <div className="stats-text">
          완료 {completedCount}/{todos.length} ({progress}%)
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
