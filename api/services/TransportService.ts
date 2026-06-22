import type { TransportScheduleItem } from '../../shared/types';
import { LoanService } from './LoanService';

export const TransportService = {
  getSchedule(days: number = 30): TransportScheduleItem[] {
    const loans = LoanService.getAll();
    const items: TransportScheduleItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    for (const loan of loans) {
      if (loan.status === 'returned') continue;
      if (!loan.exhibits || loan.exhibits.length === 0) continue;

      const loanDate = new Date(loan.loanDate);
      loanDate.setHours(0, 0, 0, 0);
      const returnDate = new Date(loan.returnDate);
      returnDate.setHours(0, 0, 0, 0);

      if (loanDate >= today && loanDate <= endDate) {
        items.push({
          date: loan.loanDate,
          type: 'outbound',
          loanId: loan.id,
          institutionName: loan.institutionName ?? '',
          exhibits: loan.exhibits,
          transportMethod: loan.transportMethod,
        });
      }

      if (returnDate >= today && returnDate <= endDate) {
        items.push({
          date: loan.returnDate,
          type: 'return',
          loanId: loan.id,
          institutionName: loan.institutionName ?? '',
          exhibits: loan.exhibits,
          transportMethod: loan.transportMethod,
        });
      }
    }

    items.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.type === 'outbound' ? -1 : 1;
    });

    return items;
  },
};
