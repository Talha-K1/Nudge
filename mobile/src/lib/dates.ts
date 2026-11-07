export function parseDate(s: string) {
  return new Date(s.length === 10 ? `${s}T00:00:00` : s);
}
export function daysUntil(s: string) {
  const target = parseDate(s); target.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
export function formatDue(s?: string | null) {
  if (!s) return 'No due date';
  const n = daysUntil(s);
  if (n < 0) return `Overdue by ${-n} day${-n === 1 ? '' : 's'}`;
  if (n === 0) return 'Due today';
  if (n === 1) return 'Due tomorrow';
  return `Due ${parseDate(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}