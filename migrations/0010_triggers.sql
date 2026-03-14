CREATE TRIGGER IF NOT EXISTS trg_app_settings_updated_at
AFTER UPDATE ON app_settings
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE app_settings
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE key = NEW.key;
END;

CREATE TRIGGER IF NOT EXISTS trg_clients_updated_at
AFTER UPDATE ON clients
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE clients
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_course_leads_updated_at
AFTER UPDATE ON course_leads
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE course_leads
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_course_types_updated_at
AFTER UPDATE ON course_types
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE course_types
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dict_cities_updated_at
AFTER UPDATE ON dict_cities
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE dict_cities
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dict_sources_updated_at
AFTER UPDATE ON dict_sources
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE dict_sources
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dict_spheres_updated_at
AFTER UPDATE ON dict_spheres
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE dict_spheres
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_projects_updated_at
AFTER UPDATE ON projects
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE projects
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_service_types_updated_at
AFTER UPDATE ON service_types
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE service_types
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tasks_updated_at
AFTER UPDATE ON tasks
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE tasks
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users
  SET updated_at = (CAST(strftime('%s','now') AS INTEGER))
  WHERE id = NEW.id;
END;
