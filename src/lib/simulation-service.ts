import { query } from './db';
import { SimulationResult } from './simulation-generator';

export async function saveSimulationResult(result: SimulationResult) {
    const existing = await query(
        'SELECT id FROM simulation_results WHERE simulation_date = ? AND simulation_hour = ?',
        [result.simulation_date, result.simulation_hour]
    );

    if (existing.length > 0) {
        // Update existing
        await query(`
            UPDATE simulation_results SET
                special_prize = ?, prize_1 = ?, prize_2 = ?, prize_3 = ?,
                prize_4 = ?, prize_5 = ?, prize_6 = ?, prize_7 = ?
            WHERE simulation_date = ? AND simulation_hour = ?
        `, [
            result.special_prize, result.prize_1,
            JSON.stringify(result.prize_2), JSON.stringify(result.prize_3),
            JSON.stringify(result.prize_4), JSON.stringify(result.prize_5),
            JSON.stringify(result.prize_6), JSON.stringify(result.prize_7),
            result.simulation_date, result.simulation_hour
        ]);
    } else {
        // Insert new
        await query(`
            INSERT INTO simulation_results (
                simulation_date, simulation_hour, simulation_time,
                special_prize, prize_1, prize_2, prize_3,
                prize_4, prize_5, prize_6, prize_7
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            result.simulation_date, result.simulation_hour, result.simulation_time,
            result.special_prize, result.prize_1,
            JSON.stringify(result.prize_2), JSON.stringify(result.prize_3),
            JSON.stringify(result.prize_4), JSON.stringify(result.prize_5),
            JSON.stringify(result.prize_6), JSON.stringify(result.prize_7)
        ]);
    }
}

export async function getSimulationsByDate(date: string) {
    const results = await query(
        'SELECT * FROM simulation_results WHERE simulation_date = ? ORDER BY simulation_hour ASC',
        [date]
    );

    return results.map((row: any) => ({
        ...row,
        prize_2: JSON.parse(row.prize_2),
        prize_3: JSON.parse(row.prize_3),
        prize_4: JSON.parse(row.prize_4),
        prize_5: JSON.parse(row.prize_5),
        prize_6: JSON.parse(row.prize_6),
        prize_7: JSON.parse(row.prize_7)
    }));
}

export async function deleteSimulationsByDate(date: string) {
    const result: any = await query(
        'DELETE FROM simulation_results WHERE simulation_date = ?',
        [date]
    );
    return result.affectedRows || 0;
}
