CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT,
  telegram_id INTEGER,
  moizvonki_email TEXT,
  login TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin','pm','fin','sale','rop')),
  pass_algo TEXT NOT NULL DEFAULT 'pbkdf2_sha256',
  pass_salt_hex TEXT NOT NULL,
  pass_hash_hex TEXT NOT NULL,
  pass_iter INTEGER NOT NULL DEFAULT 100000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  token_hash_hex TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  last_seen_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
