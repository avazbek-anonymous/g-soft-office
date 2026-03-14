CREATE TABLE IF NOT EXISTS lead_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES course_leads(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_chat_task_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES course_leads(id),
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  created_by INTEGER NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
