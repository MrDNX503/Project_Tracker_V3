-- KashFinance Project Tracker V3 — Complete Schema
-- Version: 1
-- All IDs use lower(hex(randomblob(16))) for UUID-like generation
-- All timestamps stored as ISO-8601 TEXT via datetime('now')

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT '#8b5cf6',
    status TEXT CHECK(status IN ('planning','active','paused','completed','archived')) DEFAULT 'planning',
    priority INTEGER CHECK(priority BETWEEN 1 AND 5) DEFAULT 3,
    progress REAL CHECK(progress BETWEEN 0 AND 100) DEFAULT 0,
    start_date TEXT,
    target_date TEXT,
    completed_date TEXT,
    tags TEXT, -- JSON array stored as text
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

CREATE TRIGGER IF NOT EXISTS trg_projects_updated_at
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    UPDATE projects SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('pending','in_progress','completed','skipped')) DEFAULT 'pending',
    due_date TEXT,
    completed_date TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('todo','in_progress','done','cancelled')) DEFAULT 'todo',
    priority INTEGER CHECK(priority BETWEEN 1 AND 5) DEFAULT 3,
    estimated_hours REAL,
    actual_hours REAL,
    due_date TEXT,
    completed_date TEXT,
    tags TEXT, -- JSON array stored as text
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

CREATE TRIGGER IF NOT EXISTS trg_tasks_updated_at
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    UPDATE tasks SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ============================================================
-- PROGRESS LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS progress_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    log_type TEXT CHECK(log_type IN ('update','note','blocker','achievement')) DEFAULT 'update',
    content TEXT NOT NULL,
    mood TEXT CHECK(mood IN ('focused','productive','struggling','procrastinating','neutral')),
    hours_worked REAL,
    logged_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_progress_logs_project ON progress_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_logged_at ON progress_logs(logged_at);

-- ============================================================
-- DAILY PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_plans (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    plan_date TEXT NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    time_start TEXT,
    time_end TEXT,
    is_calendar_event INTEGER DEFAULT 0,
    calendar_event_id TEXT,
    status TEXT CHECK(status IN ('scheduled','in_progress','completed','skipped','rescheduled')) DEFAULT 'scheduled',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_status ON daily_plans(status);

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    remind_at TEXT NOT NULL,
    repeat_rule TEXT,
    is_active INTEGER DEFAULT 1,
    last_triggered TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);

-- ============================================================
-- SUSAN CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS susan_conversations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    role TEXT CHECK(role IN ('user','susan','system')) NOT NULL,
    content TEXT NOT NULL,
    context TEXT, -- JSON metadata
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_susan_conversations_role ON susan_conversations(role);
CREATE INDEX IF NOT EXISTS idx_susan_conversations_created ON susan_conversations(created_at);

-- ============================================================
-- SETTINGS (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_settings_updated_at
AFTER UPDATE ON settings
FOR EACH ROW
BEGIN
    UPDATE settings SET updated_at = datetime('now') WHERE key = OLD.key;
END;

-- ============================================================
-- ANALYTICS SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    snapshot_date TEXT NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    tasks_total INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    hours_logged REAL DEFAULT 0,
    progress REAL DEFAULT 0,
    susan_score REAL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_analytics_project ON analytics_snapshots(project_id);

-- ============================================================
-- Seed initial schema version
-- ============================================================
INSERT OR IGNORE INTO settings (key, value) VALUES ('schema_version', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('app_initialized', datetime('now'));
