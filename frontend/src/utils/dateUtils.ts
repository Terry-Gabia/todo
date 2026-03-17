export function getDday(dueDate: number): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.ceil((dueDay - today) / (1000 * 60 * 60 * 24));
}

export function getDdayText(dueDate: number): string {
  const diff = getDday(dueDate);
  if (diff === 0) return 'D-Day';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export function getDdayColor(dueDate: number): string {
  const diff = getDday(dueDate);
  if (diff < 0) return 'dday-overdue';
  if (diff === 0) return 'dday-today';
  if (diff <= 2) return 'dday-soon';
  return 'dday-normal';
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isToday(timestamp: number): boolean {
  return getDday(timestamp) === 0;
}
