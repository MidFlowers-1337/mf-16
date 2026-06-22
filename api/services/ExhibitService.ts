import { getDb } from '../db';
import type { Exhibit, ExhibitStatus } from '../../shared/types';

interface DbExhibit {
  id: number;
  name: string;
  category: string;
  insurance_value: number;
  requires_temp_control: number;
  status: ExhibitStatus;
  created_at: string;
  updated_at: string;
}

function mapExhibit(row: DbExhibit): Exhibit {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    insuranceValue: row.insurance_value,
    requiresTemperatureControl: row.requires_temp_control === 1,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const ExhibitService = {
  getAll(filters?: { category?: string; status?: ExhibitStatus; search?: string }): Exhibit[] {
    const db = getDb();
    let sql = 'SELECT * FROM exhibits WHERE 1=1';
    const params: (string | number)[] = [];

    if (filters?.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.search) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY id DESC';
    const rows = db.prepare(sql).all(...params) as DbExhibit[];
    return rows.map(mapExhibit);
  },

  getById(id: number): Exhibit | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM exhibits WHERE id = ?').get(id) as DbExhibit | undefined;
    return row ? mapExhibit(row) : null;
  },

  getCategories(): string[] {
    const db = getDb();
    const rows = db.prepare('SELECT DISTINCT category FROM exhibits ORDER BY category').all() as { category: string }[];
    return rows.map(r => r.category);
  },

  create(data: {
    name: string;
    category: string;
    insuranceValue: number;
    requiresTemperatureControl: boolean;
    status: ExhibitStatus;
  }): Exhibit {
    const db = getDb();
    const info = db.prepare(`
      INSERT INTO exhibits (name, category, insurance_value, requires_temp_control, status, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(
      data.name,
      data.category,
      data.insuranceValue,
      data.requiresTemperatureControl ? 1 : 0,
      data.status
    );
    const id = Number(info.lastInsertRowid);
    return this.getById(id)!;
  },

  update(id: number, data: Partial<{
    name: string;
    category: string;
    insuranceValue: number;
    requiresTemperatureControl: boolean;
    status: ExhibitStatus;
  }>): Exhibit | null {
    const db = getDb();
    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      params.push(data.category);
    }
    if (data.insuranceValue !== undefined) {
      fields.push('insurance_value = ?');
      params.push(data.insuranceValue);
    }
    if (data.requiresTemperatureControl !== undefined) {
      fields.push('requires_temp_control = ?');
      params.push(data.requiresTemperatureControl ? 1 : 0);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    }

    if (fields.length === 0) return this.getById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE exhibits SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.getById(id);
  },

  delete(id: number): boolean {
    const db = getDb();
    const info = db.prepare('DELETE FROM exhibits WHERE id = ?').run(id);
    return info.changes > 0;
  },

  getByIds(ids: number[]): Exhibit[] {
    if (ids.length === 0) return [];
    const db = getDb();
    const placeholders = ids.map(() => '?').join(',');
    const rows = db.prepare(`SELECT * FROM exhibits WHERE id IN (${placeholders})`).all(...ids) as DbExhibit[];
    return rows.map(mapExhibit);
  },
};
