import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateSimulationResult } from '@/lib/simulation-generator';
import { saveSimulationResult } from '@/lib/simulation-service';

export async function GET(request: Request) {
    try {
        // 1. Create table (SQLite compatible)
        console.log('Creating simulation_results table...');
        await query(`
            CREATE TABLE IF NOT EXISTS simulation_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                simulation_date TEXT NOT NULL,
                simulation_hour INTEGER NOT NULL,
                simulation_time TEXT NOT NULL,
                special_prize TEXT,
                prize_1 TEXT,
                prize_2 TEXT,
                prize_3 TEXT,
                prize_4 TEXT,
                prize_5 TEXT,
                prize_6 TEXT,
                prize_7 TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(simulation_date, simulation_hour)
            )
        `);

        // Create index
        await query(`
            CREATE INDEX IF NOT EXISTS idx_simulation_date 
            ON simulation_results(simulation_date)
        `);

        console.log('✅ Table created');

        // 2. Generate 3 test simulations
        console.log('Generating 3 test simulations...');
        const results = [];
        for (let hour = 0; hour < 3; hour++) {
            const result = generateSimulationResult(hour);
            await saveSimulationResult(result);
            results.push(result);
            console.log(`✅ Simulation ${hour + 1} saved`);
        }

        return NextResponse.json({
            success: true,
            message: 'Setup complete! Table created and 3 simulations generated.',
            count: results.length,
            simulations: results
        });
    } catch (error: any) {
        console.error('Setup error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
