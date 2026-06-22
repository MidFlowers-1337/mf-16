import type {
  Exhibit,
  Institution,
  LoanRecord,
  RiskItem,
  TransportScheduleItem,
  CreateLoanRequest,
  ExhibitStatus,
  RiskSeverity,
  LoanStatus,
} from '../../shared/types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  exhibits: {
    list: (params?: { category?: string; status?: ExhibitStatus; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.status) qs.set('status', params.status);
      if (params?.search) qs.set('search', params.search);
      const query = qs.toString();
      return request<Exhibit[]>(`/exhibits${query ? '?' + query : ''}`);
    },
    categories: () => request<string[]>('/exhibits/categories'),
    get: (id: number) => request<Exhibit>(`/exhibits/${id}`),
    create: (data: Partial<Exhibit>) => request<Exhibit>('/exhibits', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Exhibit>) =>
      request<Exhibit>(`/exhibits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request<{ success: boolean }>(`/exhibits/${id}`, { method: 'DELETE' }),
  },

  institutions: {
    list: () => request<Institution[]>('/institutions'),
    get: (id: number) => request<Institution>(`/institutions/${id}`),
    create: (data: Partial<Institution>) =>
      request<Institution>('/institutions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Institution>) =>
      request<Institution>(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request<{ success: boolean }>(`/institutions/${id}`, { method: 'DELETE' }),
  },

  loans: {
    list: () => request<LoanRecord[]>('/loans'),
    get: (id: number) => request<LoanRecord>(`/loans/${id}`),
    validate: (data: CreateLoanRequest) =>
      request<{ risks: RiskItem[] }>('/loans/validate', { method: 'POST', body: JSON.stringify(data) }),
    create: (data: CreateLoanRequest) =>
      request<{ loan: LoanRecord; risks: RiskItem[] }>('/loans', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: LoanStatus, actualReturnDate?: string) =>
      request<LoanRecord>(`/loans/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, actualReturnDate }),
      }),
    remove: (id: number) => request<{ success: boolean }>(`/loans/${id}`, { method: 'DELETE' }),
  },

  risks: {
    list: (params?: { severity?: RiskSeverity; resolved?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.severity) qs.set('severity', params.severity);
      if (params?.resolved !== undefined) qs.set('resolved', String(params.resolved));
      const query = qs.toString();
      return request<RiskItem[]>(`/risks${query ? '?' + query : ''}`);
    },
    resolve: (id: string) =>
      request<RiskItem>(`/risks/${id}/resolve`, { method: 'POST' }),
  },

  transport: {
    schedule: (days: number = 30) =>
      request<TransportScheduleItem[]>(`/transport/schedule?days=${days}`),
  },
};
