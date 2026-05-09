-- SQLite Schema for XSMB Lottery

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    category TEXT DEFAULT 'news',
    status TEXT DEFAULT 'draft',
    thumbnail_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    author_id INTEGER,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    views INTEGER DEFAULT 0
);

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'editor',
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: statistics_cache
CREATE TABLE IF NOT EXISTS statistics_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_type TEXT NOT NULL,
    stat_key TEXT NOT NULL,
    stat_value TEXT NOT NULL, -- Stored as JSON string
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_type, stat_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Default Admin
INSERT OR IGNORE INTO admins (username, password_hash, full_name, email, role) 
VALUES ('admin', '$2a$10$chTUgSiuCMS/pFb3CbWeUOUhFVmJsPst79yurspsDCCBzaXuXgUuq', 'Administrator', 'admin@xsmb.local', 'super_admin');

-- Table: api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    `key` TEXT NOT NULL UNIQUE,
    provider TEXT DEFAULT 'google',
    status TEXT DEFAULT 'active',
    usage_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: ai_predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draw_date TEXT NOT NULL UNIQUE,
    predicted_pairs TEXT, -- JSON array
    actual_result TEXT,   -- Comma separated or JSON
    is_correct INTEGER DEFAULT 0,
    confidence_score REAL DEFAULT 0,
    accuracy_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
