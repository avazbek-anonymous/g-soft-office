CREATE INDEX IF NOT EXISTS idx_bot_chat_messages_chat_time
  ON bot_chat_messages(chat_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_bot_chats_last_message_at
  ON bot_chats(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_bot_chats_unread
  ON bot_chats(unread_for_staff DESC, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_company_id
  ON clients(company_id);

CREATE INDEX IF NOT EXISTS idx_clients_type
  ON clients(type);

CREATE INDEX IF NOT EXISTS idx_course_leads_company
  ON course_leads(company_id);

CREATE INDEX IF NOT EXISTS idx_course_leads_lead
  ON course_leads(lead_client_id);

CREATE INDEX IF NOT EXISTS idx_course_leads_status
  ON course_leads(status);

CREATE INDEX IF NOT EXISTS idx_lcm_lead_active
  ON lead_chat_messages(lead_id, is_active);

CREATE INDEX IF NOT EXISTS idx_lcm_lead_created
  ON lead_chat_messages(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lctl_lead_active
  ON lead_chat_task_links(lead_id, is_active);

CREATE INDEX IF NOT EXISTS idx_lctl_lead_created
  ON lead_chat_task_links(lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lctl_task_id
  ON lead_chat_task_links(task_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires
  ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_task_time_logs_open
  ON task_time_logs(user_id, end_at);

CREATE INDEX IF NOT EXISTS idx_task_time_logs_task
  ON task_time_logs(task_id);

CREATE INDEX IF NOT EXISTS idx_task_time_logs_user
  ON task_time_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee
  ON tasks(assignee_user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_project
  ON tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_tasks_status
  ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_tasks_lead_id
  ON tasks(lead_id);

CREATE INDEX IF NOT EXISTS idx_tasks_lead_status_deadline
  ON tasks(lead_id, status, deadline_at);

CREATE UNIQUE INDEX IF NOT EXISTS ux_tasks_one_in_progress_per_user
  ON tasks(assignee_user_id)
  WHERE status = 'in_progress' AND is_active = 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_moizvonki_email_unique
  ON users(moizvonki_email)
  WHERE moizvonki_email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_telegram_id
  ON users(telegram_id)
  WHERE telegram_id IS NOT NULL;
