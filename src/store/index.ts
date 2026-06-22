import { create } from 'zustand';
import type {
  Exhibit,
  Institution,
  LoanRecord,
  RiskItem,
  TransportScheduleItem,
} from '../../shared/types';
import { api } from '../api/client';

interface AppState {
  exhibits: Exhibit[];
  institutions: Institution[];
  loans: LoanRecord[];
  risks: RiskItem[];
  schedule: TransportScheduleItem[];
  loading: boolean;
  error: string | null;

  loadAll: () => Promise<void>;
  loadExhibits: () => Promise<void>;
  loadInstitutions: () => Promise<void>;
  loadLoans: () => Promise<void>;
  loadRisks: () => Promise<void>;
  loadSchedule: () => Promise<void>;
  resolveRisk: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  exhibits: [],
  institutions: [],
  loans: [],
  risks: [],
  schedule: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const [exhibits, institutions, loans, risks, schedule] = await Promise.all([
        api.exhibits.list(),
        api.institutions.list(),
        api.loans.list(),
        api.risks.list(),
        api.transport.schedule(30),
      ]);
      set({ exhibits, institutions, loans, risks, schedule, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  loadExhibits: async () => {
    try {
      const exhibits = await api.exhibits.list();
      set({ exhibits });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  loadInstitutions: async () => {
    try {
      const institutions = await api.institutions.list();
      set({ institutions });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  loadLoans: async () => {
    try {
      const loans = await api.loans.list();
      set({ loans });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  loadRisks: async () => {
    try {
      const risks = await api.risks.list();
      set({ risks });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  loadSchedule: async () => {
    try {
      const schedule = await api.transport.schedule(30);
      set({ schedule });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  resolveRisk: async (id: string) => {
    try {
      await api.risks.resolve(id);
      const risks = get().risks.map(r => (r.id === id ? { ...r, resolved: true } : r));
      set({ risks });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
