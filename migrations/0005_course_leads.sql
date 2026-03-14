CREATE TABLE IF NOT EXISTS course_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_client_id INTEGER NOT NULL,
  company_id INTEGER,
  course_type_id INTEGER NOT NULL,
  course_price REAL NOT NULL DEFAULT 0,
  course_start_date INTEGER,
  currency TEXT NOT NULL DEFAULT 'UZS',
  agreed_amount REAL,
  paid_amount REAL,
  status TEXT NOT NULL CHECK (
    status IN ('new','need_call','thinking','waiting_pay','enrolled','studying','canceled')
  ),
  comment TEXT,
  cancel_reason TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  deleted_at INTEGER,
  deleted_by INTEGER,
  FOREIGN KEY (lead_client_id) REFERENCES clients(id),
  FOREIGN KEY (company_id) REFERENCES clients(id),
  FOREIGN KEY (course_type_id) REFERENCES course_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);
