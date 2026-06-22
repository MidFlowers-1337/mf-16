import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';
import type { RiskItem, RiskSeverity, RiskType } from '../../shared/types';
import { ExhibitService } from './ExhibitService';

interface DbRisk {
  id: string;
  type: RiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  exhibit_id: number | null;
  loan_id: number | null;
  resolved: number;
  created_at: string;
}

function mapRisk(row: DbRisk): RiskItem {
  const exhibit = row.exhibit_id ? ExhibitService.getById(row.exhibit_id) : null;
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    exhibitId: row.exhibit_id ?? undefined,
    exhibitName: exhibit?.name,
    loanId: row.loan_id ?? undefined,
    resolved: row.resolved === 1,
    createdAt: row.created_at,
  };
}

export const RiskService = {
  getAll(filters?: { severity?: RiskSeverity; resolved?: boolean }): RiskItem[] {
    const db = getDb();
    let sql = 'SELECT * FROM risks WHERE 1=1';
    const params: (string | number)[] = [];

    if (filters?.severity) {
      sql += ' AND severity = ?';
      params.push(filters.severity);
    }
    if (filters?.resolved !== undefined) {
      sql += ' AND resolved = ?';
      params.push(filters.resolved ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params) as DbRisk[];
    return rows.map(mapRisk);
  },

  create(data: {
    type: RiskType;
    severity: RiskSeverity;
    title: string;
    description: string;
    exhibitId?: number;
    loanId?: number;
  }): RiskItem {
    const db = getDb();
    const id = uuidv4();
    db.prepare(`
      INSERT INTO risks (id, type, severity, title, description, exhibit_id, loan_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.type,
      data.severity,
      data.title,
      data.description,
      data.exhibitId ?? null,
      data.loanId ?? null
    );
    return this.getById(id)!;
  },

  getById(id: string): RiskItem | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM risks WHERE id = ?').get(id) as DbRisk | undefined;
    return row ? mapRisk(row) : null;
  },

  resolve(id: string): RiskItem | null {
    const db = getDb();
    db.prepare("UPDATE risks SET resolved = 1 WHERE id = ?").run(id);
    return this.getById(id);
  },

  findExisting(data: { type: RiskType; loanId?: number; exhibitId?: number }): RiskItem | null {
    const db = getDb();
    const row = db.prepare(`
      SELECT * FROM risks
      WHERE type = ? AND resolved = 0
        AND (loan_id = ? OR loan_id IS NULL)
        AND (exhibit_id = ? OR exhibit_id IS NULL)
      LIMIT 1
    `).get(
      data.type,
      data.loanId ?? null,
      data.exhibitId ?? null
    ) as DbRisk | undefined;
    return row ? mapRisk(row) : null;
  },

  deleteByLoanId(loanId: number) {
    const db = getDb();
    db.prepare('DELETE FROM risks WHERE loan_id = ?').run(loanId);
  },
};
