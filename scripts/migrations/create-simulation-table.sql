-- Migration: Create simulation_results table
-- Run this SQL in your MySQL database

CREATE TABLE IF NOT EXISTS simulation_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_date DATE NOT NULL,
    simulation_hour TINYINT NOT NULL,
    simulation_time TIME NOT NULL,
    special_prize VARCHAR(5),
    prize_1 VARCHAR(5),
    prize_2 JSON,
    prize_3 JSON,
    prize_4 JSON,
    prize_5 JSON,
    prize_6 JSON,
    prize_7 JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_simulation (simulation_date, simulation_hour),
    INDEX idx_date (simulation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
