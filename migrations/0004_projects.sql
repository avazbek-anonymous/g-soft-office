CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  service_type_id INTEGER NOT NULL,
  meeting_at INTEGER,
  deadline_at INTEGER,
  amount REAL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  pm_user_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('new','tz_given','offer_given','in_progress','later','done','review','canceled')
  ),
  comment TEXT,
  cancel_reason TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  deleted_at INTEGER,
  deleted_by INTEGER,
  review INTEGER,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id),
  FOREIGN KEY (pm_user_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);
