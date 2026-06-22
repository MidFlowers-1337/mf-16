import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return '¥' + value.toLocaleString('zh-CN');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const exhibitStatusLabels: Record<string, string> = {
  in_house: '在馆',
  on_loan: '已借出',
  maintenance: '维护中',
};

export const loanStatusLabels: Record<string, string> = {
  pending: '待借出',
  active: '借展中',
  returned: '已归还',
  overdue: '已逾期',
};

export const transportMethodLabels: Record<string, string> = {
  standard: '普通运输',
  temperature_controlled: '恒温运输',
  special: '特种运输',
};

export const riskTypeLabels: Record<string, string> = {
  time_conflict: '时间冲突',
  temp_control: '恒温要求',
  insurance: '保险额度',
  overdue: '逾期未还',
};

export const riskSeverityLabels: Record<string, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
};
