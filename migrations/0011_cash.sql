CREATE TABLE IF NOT EXISTS dict_cash_income_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE IF NOT EXISTS dict_cash_expense_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE IF NOT EXISTS dict_payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  currency_mode TEXT NOT NULL DEFAULT 'ANY'
    CHECK (currency_mode IN ('ANY','USD','UZS')),
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE IF NOT EXISTS cash_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movement_type TEXT NOT NULL
    CHECK (movement_type IN ('income','expense')),
  category_id INTEGER,
  counterparty_client_id INTEGER,
  object_type TEXT
    CHECK (object_type IS NULL OR object_type IN ('course','project')),
  object_id INTEGER,
  payment_method_id INTEGER,
  currency TEXT NOT NULL DEFAULT 'UZS',
  rate REAL NOT NULL DEFAULT 1,
  amount REAL NOT NULL DEFAULT 0,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','confirmed','canceled')),
  created_by INTEGER NOT NULL,
  confirmed_by INTEGER,
  confirmed_at INTEGER,
  canceled_by INTEGER,
  canceled_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  FOREIGN KEY (counterparty_client_id) REFERENCES clients(id),
  FOREIGN KEY (payment_method_id) REFERENCES dict_payment_methods(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (confirmed_by) REFERENCES users(id),
  FOREIGN KEY (canceled_by) REFERENCES users(id)
);
