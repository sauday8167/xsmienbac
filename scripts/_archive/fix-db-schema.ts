
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

async function fixSchema() {
    const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
    console.log(`🔧 Fixing Database Schema: ${dbPath}`);

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // 1. Create admins table
        console.log('1️⃣ Checking table: admins');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                email TEXT,
                role TEXT DEFAULT 'admin',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('   ✅ Table created/verified.');

        // 2. Insert default admin if empty
        const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
        if (adminCount.count === 0) {
            console.log('2️⃣ Seeding default admin...');
            const passwordHash = await bcrypt.hash('admin123', 10);
            await db.run(`
                INSERT INTO admins (username, password_hash, full_name, role, is_active)
                VALUES (?, ?, ?, ?, ?)
            `, ['admin', passwordHash, 'Administrator', 'super_admin', true]);
            console.log('   ✅ Default admin created (User: admin / Pass: admin123)');
        } else {
            console.log('   ℹ️ Admin users already exist.');
        }

    } catch (error) {
        console.error("❌ Fix failed:", error);
    }
}

fixSchema();
