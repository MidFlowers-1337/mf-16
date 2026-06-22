import { getDb } from '../db';
import type { Institution } from '../../shared/types';

interface DbInstitution {
  id: number;
  name: string;
  contact_person: string;
  contact_phone: string;
  insurance_coverage: number;
  created_at: string;
  updated_at: string;
}

function mapInstitution(row: DbInstitution): Institution {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    contactPhone: row.contact_phone,
    insuranceCoverage: row.insurance_coverage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const InstitutionService = {
  getAll(): Institution[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM institutions ORDER BY id DESC').all() as DbInstitution[];
    return rows.map(mapInstitution);
  },

  getById(id: number): Institution | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM institutions WHERE id = ?').get(id) as DbInstitution | undefined;
    return row ? mapInstitution(row) : null;
  },

  create(data: {
    name: string;
    contactPerson: string;
    contactPhone: string;
    insuranceCoverage: number;
  }): Institution {
    const db = getDb();
    const info = db.prepare(`
      INSERT INTO institutions (name, contact_person, contact_phone, insurance_coverage, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(
      data.name,
      data.contactPerson,
      data.contactPhone,
      data.insuranceCoverage
    );
    const id = Number(info.lastInsertRowid);
    return this.getById(id)!;
  },

  update(id: number, data: Partial<{
    name: string;
    contactPerson: string;
    contactPhone: string;
    insuranceCoverage: number;
  }>): Institution | null {
    const db = getDb();
    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.contactPerson !== undefined) {
      fields.push('contact_person = ?');
      params.push(data.contactPerson);
    }
    if (data.contactPhone !== undefined) {
      fields.push('contact_phone = ?');
      params.push(data.contactPhone);
    }
    if (data.insuranceCoverage !== undefined) {
      fields.push('insurance_coverage = ?');
      params.push(data.insuranceCoverage);
    }

    if (fields.length === 0) return this.getById(id);

    fields.push("updated_at = datetime('now')");
    params.push(id);

    db.prepare(`UPDATE institutions SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.getById(id);
  },

  delete(id: number): boolean {
    const db = getDb();
    const info = db.prepare('DELETE FROM institutions WHERE id = ?').run(id);
    return info.changes > 0;
  },
};
