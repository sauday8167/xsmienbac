import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Database connection singleton
let db: Database | null = null;

// Ensure we don't create multiple connections in dev
declare global {
    var sqliteDb: Database | undefined;
}

export async function getDb() {
    if (global.sqliteDb) return global.sqliteDb;

    if (!db) {
        db = await open({
            filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
            driver: sqlite3.Database
        });

        // Enable WAL mode for better concurrency
        await db.run('PRAGMA journal_mode = WAL;');

        if (process.env.NODE_ENV === 'development') {
            global.sqliteDb = db;
        }
    }
    return db;
}

/**
 * Executes a SQL query.
 * For SELECT, refers to db.all().
 * For INSERT/UPDATE/DELETE, refers to db.run().
 * Mimics MySQL2 'execute' return signature [rows, fields] partially 
 * to minimize refactoring elsewhere, returning [rows, null].
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
    const db = await getDb();

    // Simple heuristic to distinguish SELECT from others
    const command = sql.trim().split(' ')[0].toUpperCase();

    try {
        if (command === 'SELECT') {
            const result = await db.all(sql, params);
            return result as T;
        } else {
            const result = await db.run(sql, params);
            // In MySQL2, for non-SELECT, it returns an OKPacket-like object.
            // But the generic typing <T> usually expects the Result type.
            // If the caller expects an array (like input from SELECT), we return empty array?
            // Checking usage: usually usage is "await query('INSERT...')" and ignoring result,
            // or "const res = await query(...)".
            // Let's return the run result.
            return result as T;
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Emulate queryOne for compatibility
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const db = await getDb();
    const result = await db.get(sql, params);
    return result || null;
}

// Close pool (for graceful shutdown)
export async function closePool() {
    if (db) {
        await db.close();
        db = null;
    }
}
