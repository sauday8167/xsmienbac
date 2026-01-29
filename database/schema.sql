-- Xổ Số Miền Bắc Database Schema
-- Created: 2026-01-08
-- Description: Complete database schema for XSMB lottery website

-- Create database
CREATE DATABASE IF NOT EXISTS xsmb_lottery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xsmb_lottery;

-- Table: xsmb_results
-- Stores daily lottery results for XSMB
CREATE TABLE IF NOT EXISTS xsmb_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    draw_date DATE NOT NULL UNIQUE,
    
    -- Giải đặc biệt (1 số)
    special_prize VARCHAR(10) NOT NULL,
    
    -- Giải nhất (1 số)
    prize_1 VARCHAR(10) NOT NULL,
    
    -- Giải nhì (2 số) - stored as JSON array
    prize_2 JSON NOT NULL,
    
    -- Giải ba (6 số) - stored as JSON array
    prize_3 JSON NOT NULL,
    
    -- Giải tư (4 số) - stored as JSON array
    prize_4 JSON NOT NULL,
    
    -- Giải năm (6 số) - stored as JSON array
    prize_5 JSON NOT NULL,
    
    -- Giải sáu (3 số) - stored as JSON array
    prize_6 JSON NOT NULL,
    
    -- Giải bảy (4 số) - stored as JSON array
    prize_7 JSON NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_draw_date (draw_date DESC),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: posts
-- Manages news articles and soi cầu (lottery predictions)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- Article content (supports HTML)
    content TEXT NOT NULL,
    
    -- Short excerpt for listing pages
    excerpt VARCHAR(500),
    
    -- Featured image
    thumbnail VARCHAR(500),
    
    -- Category: news, soi-cau, tips, analysis
    category ENUM('news', 'soi-cau', 'tips', 'analysis') DEFAULT 'news',
    
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    
    -- Publication status
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    
    -- View counter
    views INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_published_at (published_at DESC),
    INDEX idx_views (views DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: admins
-- Manages admin users for the admin panel
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Admin info
    full_name VARCHAR(100),
    email VARCHAR(100),
    avatar VARCHAR(500),
    
    -- Role and permissions
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor',
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Last login tracking
    last_login TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_username (username),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: statistics_cache
-- Caches computed statistics for performance
CREATE TABLE IF NOT EXISTS statistics_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_type VARCHAR(50) NOT NULL,
    stat_key VARCHAR(100) NOT NULL,
    stat_value JSON NOT NULL,
    
    -- Cache expiration
    expires_at TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE KEY idx_stat_type_key (stat_type, stat_key),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin account
-- Username: admin
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- Password hash generated with bcrypt rounds=10
INSERT INTO admins (username, password_hash, full_name, email, role) VALUES
('admin', '$2b$10$rKZWvXc2p0vN8YE4JGKOKuXxYf5nQ8W4B0xQJZvN8YE4JGKOKuXxY', 'Administrator', 'admin@xsmb.local', 'super_admin');

-- Sample lottery result data for testing
INSERT INTO xsmb_results (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7) VALUES
('2026-01-07', '12345', '67890', 
 '["12345", "67890"]', 
 '["11111", "22222", "33333", "44444", "55555", "66666"]',
 '["77777", "88888", "99999", "00000"]',
 '["12312", "45645", "78978", "01201", "34534", "67867"]',
 '["123", "456", "789"]',
 '["0123", "4567", "8901", "2345"]'
);

-- Sample posts for testing
INSERT INTO posts (title, slug, content, excerpt, category, status, published_at) VALUES
('Dự đoán XSMB ngày 08/01/2026', 'du-doan-xsmb-08-01-2026', 
 '<h2>Phân tích xu hướng</h2><p>Dựa trên thống kê 30 ngày gần đây, các cặp số đáng chú ý...</p>',
 'Phân tích và dự đoán kết quả xổ số miền Bắc ngày 08/01/2026 dựa trên thống kê chi tiết',
 'soi-cau', 'published', NOW()),
 
('Hướng dẫn dò vé số online', 'huong-dan-do-ve-so-online',
 '<h2>Cách dò vé số</h2><p>Để dò vé số trực tuyến, bạn làm theo các bước sau...</p>',
 'Hướng dẫn chi tiết cách dò vé số trực tuyến nhanh chóng và chính xác',
 'tips', 'published', NOW());
