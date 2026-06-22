import { getDb } from '../db';
import type {
  LoanRecord,
  LoanStatus,
  CreateLoanRequest,
  RiskItem,
  TransportMethod,
} from '../../shared/types';
import { ExhibitService } from './ExhibitService';
import { InstitutionService } from './InstitutionService';
import { RiskService } from './RiskService';

interface DbLoan {
  id: number;
  institution_id: number;
  loan_date: string;
  return_date: string;
  actual_return_date: string | null;
  transport_method: TransportMethod;
  contact_person: string;
  contact_phone: string;
  status: LoanStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function dateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 <= end2 && start2 <= end1;
}

export function detectRisksForLoan(
  req: CreateLoanRequest,
  excludeLoanId?: number
): RiskItem[] {
  const risks: RiskItem[] = [];

  const institution = InstitutionService.getById(req.institutionId);
  const exhibits = ExhibitService.getByIds(req.exhibitIds);

  for (const exhibit of exhibits) {
    if (
      exhibit.requiresTemperatureControl &&
      req.transportMethod === 'standard'
    ) {
      risks.push({
        id: `temp-${exhibit.id}`,
        type: 'temp_control',
        severity: 'medium',
        title: '恒温运输要求未满足',
        description: `展品「${exhibit.name}」要求恒温运输，但当前选择了普通运输方式`,
        exhibitId: exhibit.id,
        exhibitName: exhibit.name,
        resolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (institution && exhibit.insuranceValue > institution.insuranceCoverage) {
      risks.push({
        id: `ins-${exhibit.id}`,
        type: 'insurance',
        severity: 'high',
        title: '保险额度不足',
        description: `展品「${exhibit.name}」估值 ¥${exhibit.insuranceValue.toLocaleString()}，超过借展机构可承担额度 ¥${institution.insuranceCoverage.toLocaleString()}`,
        exhibitId: exhibit.id,
        exhibitName: exhibit.name,
        resolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const db = getDb();
  for (const exhibitId of req.exhibitIds) {
    const overlapping = db.prepare(`
      SELECT lr.* FROM loan_records lr
      JOIN loan_exhibits le ON lr.id = le.loan_id
      WHERE le.exhibit_id = ?
        AND lr.status IN ('pending', 'active', 'overdue')
        AND (? IS NULL OR lr.id != ?)
    `).all(exhibitId, excludeLoanId ?? null, excludeLoanId ?? null) as DbLoan[];

    for (const loan of overlapping) {
      if (dateOverlap(req.loanDate, req.returnDate, loan.loan_date, loan.return_date)) {
        const ex = ExhibitService.getById(exhibitId);
        risks.push({
          id: `time-${exhibitId}-${loan.id}`,
          type: 'time_conflict',
          severity: 'high',
          title: '展品借展时间冲突',
          description: `展品「${ex?.name}」在 ${req.loanDate} 至 ${req.returnDate} 期间已被借出（外借记录#${loan.id}）`,
          exhibitId,
          exhibitName: ex?.name,
          loanId: loan.id,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return risks;
}

export const LoanService = {
  getAll(): LoanRecord[] {
    const db = getDb();
    this.updateOverdueStatus();
    const rows = db.prepare('SELECT * FROM loan_records ORDER BY id DESC').all() as DbLoan[];
    return rows.map(this.mapLoan.bind(this));
  },

  getById(id: number): LoanRecord | null {
    const db = getDb();
    this.updateOverdueStatus();
    const row = db.prepare('SELECT * FROM loan_records WHERE id = ?').get(id) as DbLoan | undefined;
    return row ? this.mapLoan(row) : null;
  },

  mapLoan(row: DbLoan): LoanRecord {
    const db = getDb();
    const institution = InstitutionService.getById(row.institution_id);
    const exhibitRows = db.prepare(
      'SELECT exhibit_id FROM loan_exhibits WHERE loan_id = ?'
    ).all(row.id) as { exhibit_id: number }[];
    const exhibitIds = exhibitRows.map(r => r.exhibit_id);
    const exhibits = ExhibitService.getByIds(exhibitIds);

    return {
      id: row.id,
      institutionId: row.institution_id,
      institutionName: institution?.name,
      exhibitIds,
      exhibits,
      loanDate: row.loan_date,
      returnDate: row.return_date,
      actualReturnDate: row.actual_return_date ?? undefined,
      transportMethod: row.transport_method,
      contactPerson: row.contact_person,
      contactPhone: row.contact_phone,
      status: row.status,
      notes: row.notes ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  updateOverdueStatus() {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE loan_records
      SET status = 'overdue', updated_at = datetime('now')
      WHERE status IN ('pending', 'active')
        AND return_date < ?
        AND actual_return_date IS NULL
    `).run(today);
  },

  create(req: CreateLoanRequest): { loan: LoanRecord; risks: RiskItem[] } {
    const db = getDb();
    const risks = detectRisksForLoan(req);

    const insertLoan = db.prepare(`
      INSERT INTO loan_records (
        institution_id, loan_date, return_date, transport_method,
        contact_person, contact_phone, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLoanExhibit = db.prepare(
      'INSERT INTO loan_exhibits (loan_id, exhibit_id) VALUES (?, ?)'
    );

    let loanId = 0;
    const tx = db.transaction(() => {
      const today = new Date().toISOString().split('T')[0];
      let status: LoanStatus = 'pending';
      if (req.loanDate <= today && today <= req.returnDate) status = 'active';
      if (req.returnDate < today) status = 'overdue';

      const info = insertLoan.run(
        req.institutionId,
        req.loanDate,
        req.returnDate,
        req.transportMethod,
        req.contactPerson,
        req.contactPhone,
        status,
        req.notes ?? null
      );
      loanId = Number(info.lastInsertRowid);

      for (const exhibitId of req.exhibitIds) {
        insertLoanExhibit.run(loanId, exhibitId);
      }

      for (const r of risks) {
        RiskService.create({
          type: r.type,
          severity: r.severity,
          title: r.title,
          description: r.description,
          exhibitId: r.exhibitId,
          loanId,
        });
      }

      for (const exhibitId of req.exhibitIds) {
        db.prepare("UPDATE exhibits SET status = 'on_loan', updated_at = datetime('now') WHERE id = ?").run(exhibitId);
      }
    });
    tx();

    return { loan: this.getById(loanId)!, risks };
  },

  updateStatus(id: number, status: LoanStatus, actualReturnDate?: string): LoanRecord | null {
    const db = getDb();
    const fields: string[] = [];
    const params: (string | number)[] = [];

    fields.push('status = ?');
    params.push(status);

    if (actualReturnDate !== undefined) {
      fields.push('actual_return_date = ?');
      params.push(actualReturnDate);
    }

    fields.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE loan_records SET ${fields.join(', ')} WHERE id = ?`).run(...params);

    if (status === 'returned') {
      const exhibitRows = db.prepare(
        'SELECT exhibit_id FROM loan_exhibits WHERE loan_id = ?'
      ).all(id) as { exhibit_id: number }[];
      for (const row of exhibitRows) {
        const otherActive = db.prepare(`
          SELECT COUNT(*) as cnt FROM loan_exhibits le
          JOIN loan_records lr ON le.loan_id = lr.id
          WHERE le.exhibit_id = ? AND lr.id != ?
            AND lr.status IN ('pending', 'active', 'overdue')
        `).get(row.exhibit_id, id) as { cnt: number };
        if (otherActive.cnt === 0) {
          db.prepare("UPDATE exhibits SET status = 'in_house', updated_at = datetime('now') WHERE id = ?").run(row.exhibit_id);
        }
      }
    }

    return this.getById(id);
  },

  delete(id: number): boolean {
    const db = getDb();
    RiskService.deleteByLoanId(id);
    const exhibitRows = db.prepare(
      'SELECT exhibit_id FROM loan_exhibits WHERE loan_id = ?'
    ).all(id) as { exhibit_id: number }[];

    const info = db.prepare('DELETE FROM loan_records WHERE id = ?').run(id);

    for (const row of exhibitRows) {
      const otherActive = db.prepare(`
        SELECT COUNT(*) as cnt FROM loan_exhibits le
        JOIN loan_records lr ON le.loan_id = lr.id
        WHERE le.exhibit_id = ? AND lr.id != ?
          AND lr.status IN ('pending', 'active', 'overdue')
      `).get(row.exhibit_id, id) as { cnt: number };
      if (otherActive.cnt === 0) {
        db.prepare("UPDATE exhibits SET status = 'in_house', updated_at = datetime('now') WHERE id = ?").run(row.exhibit_id);
      }
    }

    return info.changes > 0;
  },
};
