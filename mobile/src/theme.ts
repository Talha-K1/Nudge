export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export const colors = {
  bg: '#F6F7FB', card: '#FFFFFF', text: '#111827', muted: '#6B7280',
  primary: '#4F46E5', border: '#E5E7EB',
  high: '#DC2626', medium: '#D97706', low: '#16A34A',
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };

export const priorityColor = (p: Priority) =>
  p === 'HIGH' ? colors.high : p === 'MEDIUM' ? colors.medium : colors.low;