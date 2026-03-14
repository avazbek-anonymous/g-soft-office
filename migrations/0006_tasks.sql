CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT NOT NULL,
  assignee_user_id INTEGER NOT NULL,
  project_id INTEGER,
  lead_id INTEGER,
  status TEXT NOT NULL CHECK (status IN ('new','pause','in_progress','done','canceled')),
  deadline_at INTEGER,
  cancel_reason TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  deleted_at INTEGER,
  deleted_by INTEGER,
  FOREIGN KEY (assignee_user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (lead_id) REFERENCES course_leads(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  start_at INTEGER NOT NULL,
  end_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
