import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.resolve(process.cwd(), 'museum.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS exhibits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      insurance_value REAL NOT NULL DEFAULT 0,
      requires_temp_control INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in_house',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      insurance_coverage REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS loan_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id INTEGER NOT NULL,
      loan_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      actual_return_date TEXT,
      transport_method TEXT NOT NULL DEFAULT 'standard',
      contact_person TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (institution_id) REFERENCES institutions(id)
    );

    CREATE TABLE IF NOT EXISTS loan_exhibits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      exhibit_id INTEGER NOT NULL,
      FOREIGN KEY (loan_id) REFERENCES loan_records(id) ON DELETE CASCADE,
      FOREIGN KEY (exhibit_id) REFERENCES exhibits(id),
      UNIQUE(loan_id, exhibit_id)
    );

    CREATE TABLE IF NOT EXISTS risks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      exhibit_id INTEGER,
      loan_id INTEGER,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (exhibit_id) REFERENCES exhibits(id),
      FOREIGN KEY (loan_id) REFERENCES loan_records(id)
    );

    CREATE INDEX IF NOT EXISTS idx_risks_resolved ON risks(resolved);
    CREATE INDEX IF NOT EXISTS idx_risks_severity ON risks(severity);
    CREATE INDEX IF NOT EXISTS idx_loan_records_dates ON loan_records(loan_date, return_date);
  `);

  seedDataIfEmpty();
}

function seedDataIfEmpty() {
  const database = getDb();
  const exhibitCount = database.prepare('SELECT COUNT(*) as cnt FROM exhibits').get() as { cnt: number };
  if (exhibitCount.cnt > 0) return;

  const insertExhibit = database.prepare(`
    INSERT INTO exhibits (name, category, insurance_value, requires_temp_control, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const exhibits = [
    ['商代青铜鼎', '青铜器', 5000000, 0, 'in_house'],
    ['清明上河图（复制品）', '书画', 800000, 1, 'in_house'],
    ['宋代青瓷瓶', '陶瓷', 2500000, 1, 'on_loan'],
    ['汉代玉璧', '玉器', 1800000, 0, 'in_house'],
    ['唐三彩马', '陶瓷', 3200000, 0, 'in_house'],
    ['缂丝花鸟图', '织绣', 1200000, 1, 'in_house'],
    ['战国错金银铜壶', '青铜器', 4500000, 0, 'maintenance'],
    ['明代青花大盘', '陶瓷', 2800000, 0, 'in_house'],
    ['清代翡翠朝珠', '玉器', 6000000, 0, 'in_house'],
    ['元代书法真迹', '书画', 7500000, 1, 'in_house'],
  ];

  const exhibitIds: number[] = [];
  const tx = database.transaction(() => {
    for (const ex of exhibits) {
      const info = insertExhibit.run(ex[0], ex[1], ex[2], ex[3], ex[4]);
      exhibitIds.push(Number(info.lastInsertRowid));
    }
  });
  tx();

  const insertInstitution = database.prepare(`
    INSERT INTO institutions (name, contact_person, contact_phone, insurance_coverage)
    VALUES (?, ?, ?, ?)
  `);

  const institutions = [
    ['国家博物馆', '张主任', '010-65116400', 50000000],
    ['上海博物馆', '李馆长', '021-63723500', 30000000],
    ['故宫博物院', '王研究员', '010-85007427', 80000000],
    ['南京博物院', '赵老师', '025-84803018', 15000000],
  ];

  const institutionIds: number[] = [];
  const tx2 = database.transaction(() => {
    for (const ins of institutions) {
      const info = insertInstitution.run(ins[0], ins[1], ins[2], ins[3]);
      institutionIds.push(Number(info.lastInsertRowid));
    }
  });
  tx2();

  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 30);
  const overdueDate = new Date(today);
  overdueDate.setDate(today.getDate() - 5);
  const activeLoanStart = new Date(today);
  activeLoanStart.setDate(today.getDate() - 10);
  const activeLoanEnd = new Date(today);
  activeLoanEnd.setDate(today.getDate() + 20);
  const futureLoanStart = new Date(today);
  futureLoanStart.setDate(today.getDate() + 5);
  const futureLoanEnd = new Date(today);
  futureLoanEnd.setDate(today.getDate() + 35);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const insertLoan = database.prepare(`
    INSERT INTO loan_records (institution_id, loan_date, return_date, actual_return_date, transport_method, contact_person, contact_phone, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLoanExhibit = database.prepare(`
    INSERT INTO loan_exhibits (loan_id, exhibit_id) VALUES (?, ?)
  `);

  const insertRisk = database.prepare(`
    INSERT INTO risks (id, type, severity, title, description, exhibit_id, loan_id, resolved)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const tx3 = database.transaction(() => {
    const overdueInfo = insertLoan.run(
      institutionIds[1],
      formatDate(pastDate),
      formatDate(overdueDate),
      null,
      'standard',
      '李馆长',
      '021-63723500',
      'overdue',
      '上海博物馆借展，已逾期未归还'
    );
    const overdueLoanId = Number(overdueInfo.lastInsertRowid);
    insertLoanExhibit.run(overdueLoanId, exhibitIds[2]);
    insertRisk.run(
      uuidv4(),
      'overdue',
      'medium',
      '展品逾期未归还',
      `宋代青瓷瓶借给上海博物馆，应于 ${formatDate(overdueDate)} 归还，现已逾期`,
      exhibitIds[2],
      overdueLoanId
    );

    const activeInfo = insertLoan.run(
      institutionIds[0],
      formatDate(activeLoanStart),
      formatDate(activeLoanEnd),
      null,
      'standard',
      '张主任',
      '010-65116400',
      'active',
      '国家博物馆借展中'
    );
    const activeLoanId = Number(activeInfo.lastInsertRowid);
    insertLoanExhibit.run(activeLoanId, exhibitIds[0]);

    const futureInfo = insertLoan.run(
      institutionIds[0],
      formatDate(futureLoanStart),
      formatDate(futureLoanEnd),
      null,
      'temperature_controlled',
      '张主任',
      '010-65116400',
      'pending',
      '国家博物馆即将借展'
    );
    const futureLoanId = Number(futureInfo.lastInsertRowid);
    insertLoanExhibit.run(futureLoanId, exhibitIds[1]);
  });
  tx3();
}
