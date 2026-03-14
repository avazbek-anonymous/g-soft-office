CREATE TABLE _cf_KV (
        key TEXT PRIMARY KEY,
        value BLOB
      ) WITHOUT ROWID;

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE bot_chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        direction TEXT NOT NULL,
        text TEXT,
        telegram_message_id INTEGER,
        telegram_user_id TEXT,
        telegram_username TEXT,
        telegram_first_name TEXT,
        telegram_last_name TEXT,
        staff_user_id INTEGER,
        staff_user_name TEXT,
        payload_json TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

CREATE TABLE bot_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL UNIQUE,
        chat_type TEXT,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        language_code TEXT,
        is_bot INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0,
        linked_client_id INTEGER,
        linked_client_type TEXT,
        started_at INTEGER,
        last_message_at INTEGER,
        last_message_text TEXT,
        last_message_direction TEXT,
        last_message_telegram_user_id TEXT,
        unread_for_staff INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  type TEXT NOT NULL CHECK (type IN ('company','lead')),

  company_name TEXT,           -- для company
  full_name TEXT NOT NULL,     -- ФИО владельца/лида
  phone1 TEXT NOT NULL UNIQUE,
  phone2 TEXT,

  city_id INTEGER,
  source_id INTEGER,
  sphere_id INTEGER,

  comment TEXT,
  tg_group_link TEXT,

  company_id INTEGER,          -- для lead: привязка к company (clients.id), может быть NULL

  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER,

  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  deleted_at INTEGER,
  deleted_by INTEGER,

  FOREIGN KEY (city_id) REFERENCES dict_cities(id),
  FOREIGN KEY (source_id) REFERENCES dict_sources(id),
  FOREIGN KEY (sphere_id) REFERENCES dict_spheres(id),
  FOREIGN KEY (company_id) REFERENCES clients(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);

CREATE TABLE course_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  lead_client_id INTEGER NOT NULL,   -- clients.type='lead'
  company_id INTEGER,                -- clients.type='company' (может быть NULL)

  course_type_id INTEGER NOT NULL,

  course_price REAL NOT NULL DEFAULT 0,  -- фиксируем на момент создания
  course_start_date INTEGER,             -- фиксируем на момент создания
  currency TEXT NOT NULL DEFAULT 'UZS',

  agreed_amount REAL,
  paid_amount REAL,

  status TEXT NOT NULL CHECK (
    status IN ('new','need_call','thinking','enrolled','studying','canceled')
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

CREATE TABLE course_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date INTEGER, -- epoch seconds (можно хранить 00:00:00)
  price REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'UZS',
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE dict_cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE dict_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE dict_spheres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE lead_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES course_leads(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE lead_chat_task_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL REFERENCES course_leads(id),
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  created_by INTEGER NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE projects (
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

CREATE TABLE "projects_old" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  client_id INTEGER NOT NULL,           -- company client
  service_type_id INTEGER NOT NULL,

  meeting_at INTEGER,                   -- epoch seconds
  deadline_at INTEGER,                  -- epoch seconds

  amount REAL,
  currency TEXT NOT NULL DEFAULT 'UZS',

  pm_user_id INTEGER NOT NULL,

  status TEXT NOT NULL CHECK (
    status IN ('new','tz_given','offer_given','in_progress','later','done','canceled')
  ),

  comment TEXT,
  cancel_reason TEXT,

  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,

  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  deleted_at INTEGER,
  deleted_by INTEGER, review INTEGER,

  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (service_type_id) REFERENCES service_types(id),
  FOREIGN KEY (pm_user_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);

CREATE TABLE service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 1000,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER))
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  token_hash_hex TEXT NOT NULL UNIQUE, -- sha256(token)
  expires_at INTEGER NOT NULL,         -- epoch seconds
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  last_seen_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE task_time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  start_at INTEGER NOT NULL,
  end_at INTEGER, -- NULL пока идёт
  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  FOREIGN KEY (task_id) REFERENCES "tasks_old"(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  title TEXT,
  description TEXT NOT NULL,

  assignee_user_id INTEGER NOT NULL,
  project_id INTEGER, -- NULL = задача без проекта

  status TEXT NOT NULL CHECK (status IN ('new','pause','in_progress','done','canceled')),
  deadline_at INTEGER,

  cancel_reason TEXT,

  is_active INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER NOT NULL,

  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  deleted_at INTEGER,
  deleted_by INTEGER, lead_id INTEGER REFERENCES course_leads(id),

  FOREIGN KEY (assignee_user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);

CREATE TABLE "tasks_old" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  title TEXT,
  description TEXT NOT NULL,

  assignee_user_id INTEGER NOT NULL,
  project_id INTEGER, -- NULL = задача без проекта

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
  FOREIGN KEY (project_id) REFERENCES "projects_old"(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  full_name TEXT NOT NULL,
  phone TEXT,

  login TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin','pm','fin','sale','rop')),

  pass_algo TEXT NOT NULL DEFAULT 'pbkdf2_sha256',
  pass_salt_hex TEXT NOT NULL,
  pass_hash_hex TEXT NOT NULL,
  pass_iter INTEGER NOT NULL DEFAULT 120000,

  is_active INTEGER NOT NULL DEFAULT 1,

  created_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER)),
  last_login_at INTEGER
, telegram_id INTEGER, moizvonki_email TEXT);

CREATE INDEX idx_bot_chat_messages_chat_time ON bot_chat_messages(chat_id, created_at DESC, id DESC);

CREATE INDEX idx_bot_chats_last_message_at ON bot_chats(last_message_at DESC);

CREATE INDEX idx_bot_chats_unread ON bot_chats(unread_for_staff DESC, last_message_at DESC);

CREATE INDEX idx_clients_company_id ON clients(company_id);

CREATE INDEX idx_clients_type ON clients(type);

CREATE INDEX idx_course_leads_company ON course_leads(company_id);

CREATE INDEX idx_course_leads_lead ON course_leads(lead_client_id);

CREATE INDEX idx_course_leads_status ON course_leads(status);

CREATE INDEX idx_lcm_lead_active ON lead_chat_messages(lead_id, is_active);

CREATE INDEX idx_lcm_lead_created ON lead_chat_messages(lead_id, created_at DESC);

CREATE INDEX idx_lctl_lead_active ON lead_chat_task_links(lead_id, is_active);

CREATE INDEX idx_lctl_lead_created ON lead_chat_task_links(lead_id, created_at DESC);

CREATE INDEX idx_lctl_task_id ON lead_chat_task_links(task_id);

CREATE INDEX idx_sessions_expires ON sessions(expires_at);

CREATE INDEX idx_task_time_logs_open ON task_time_logs(user_id, end_at);

CREATE INDEX idx_task_time_logs_task ON task_time_logs(task_id);

CREATE INDEX idx_task_time_logs_user ON task_time_logs(user_id);

CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);

CREATE INDEX idx_tasks_lead_status_deadline ON tasks(lead_id, status, deadline_at);

CREATE INDEX idx_tasks_assignee ON "tasks_old"(assignee_user_id);

CREATE INDEX idx_tasks_project ON "tasks_old"(project_id);

CREATE INDEX idx_tasks_status ON "tasks_old"(status);

CREATE UNIQUE INDEX ux_tasks_one_in_progress_per_user
ON "tasks_old"(assignee_user_id)
WHERE status = 'in_progress' AND is_active = 1;

CREATE UNIQUE INDEX idx_users_moizvonki_email_unique
ON users(moizvonki_email)
WHERE moizvonki_email IS NOT NULL;

CREATE UNIQUE INDEX ux_users_telegram_id
ON users(telegram_id)
WHERE telegram_id IS NOT NULL;

CREATE TRIGGER trg_app_settings_updated_at
AFTER UPDATE ON app_settings
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE app_settings
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE key = NEW.key;
END;

CREATE TRIGGER trg_clients_updated_at
AFTER UPDATE ON clients
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE clients SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_course_leads_updated_at
AFTER UPDATE ON course_leads
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE course_leads SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_course_types_updated_at
AFTER UPDATE ON course_types
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE course_types SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_dict_cities_updated_at
AFTER UPDATE ON dict_cities
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE dict_cities SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_dict_sources_updated_at
AFTER UPDATE ON dict_sources
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE dict_sources SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_dict_spheres_updated_at
AFTER UPDATE ON dict_spheres
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE dict_spheres SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_service_types_updated_at
AFTER UPDATE ON service_types
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE service_types SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_tasks_updated_at
AFTER UPDATE ON "tasks_old"
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE "tasks_old" SET updated_at = (CAST(strftime('%s','now') AS INTEGER)) WHERE id = NEW.id;
END;

CREATE TRIGGER trg_users_updated_at
AFTER UPDATE ON users
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;