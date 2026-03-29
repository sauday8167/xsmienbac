import { query, queryOne } from '../src/lib/db';

async function simulateLive() {
    console.log('🚀 Starting XSMB Live Simulation...');

    // 1. Get Today
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Target Date: ${today}`);

    // 2. Reset Data
    await query('DELETE FROM xsmb_results WHERE draw_date = ?', [today]);
    await query(`
        INSERT INTO xsmb_results (draw_date, created_at, updated_at) 
        VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [today]);
    console.log('🧹 Cleaned existing data for today.');

    // 3. Define Sequence
    const sequence = [
        { key: 'prize_1', idx: 0, val: '12345', label: 'Giải Nhất' },
        { key: 'prize_2', idx: 0, val: '23456', label: 'Giải Nhì 1' },
        { key: 'prize_2', idx: 1, val: '34567', label: 'Giải Nhì 2' },
        { key: 'prize_3', idx: 0, val: '34561', label: 'Giải Ba 1' },
        { key: 'prize_3', idx: 1, val: '34562', label: 'Giải Ba 2' },
        { key: 'prize_3', idx: 2, val: '34563', label: 'Giải Ba 3' },
        { key: 'prize_3', idx: 3, val: '34564', label: 'Giải Ba 4' },
        { key: 'prize_3', idx: 4, val: '34565', label: 'Giải Ba 5' },
        { key: 'prize_3', idx: 5, val: '34566', label: 'Giải Ba 6' },
        { key: 'prize_4', idx: 0, val: '4561', label: 'Giải Tư 1' },
        { key: 'prize_4', idx: 1, val: '4562', label: 'Giải Tư 2' },
        { key: 'prize_4', idx: 2, val: '4563', label: 'Giải Tư 3' },
        { key: 'prize_4', idx: 3, val: '4564', label: 'Giải Tư 4' },
        { key: 'prize_5', idx: 0, val: '5611', label: 'Giải Năm 1' },
        { key: 'prize_5', idx: 1, val: '5622', label: 'Giải Năm 2' },
        { key: 'prize_5', idx: 2, val: '5633', label: 'Giải Năm 3' },
        { key: 'prize_5', idx: 3, val: '5644', label: 'Giải Năm 4' },
        { key: 'prize_5', idx: 4, val: '5655', label: 'Giải Năm 5' },
        { key: 'prize_5', idx: 5, val: '5666', label: 'Giải Năm 6' },
        { key: 'prize_6', idx: 0, val: '611', label: 'Giải Sáu 1' },
        { key: 'prize_6', idx: 1, val: '622', label: 'Giải Sáu 2' },
        { key: 'prize_6', idx: 2, val: '633', label: 'Giải Sáu 3' },
        { key: 'prize_7', idx: 0, val: '71', label: 'Giải Bảy 1' },
        { key: 'prize_7', idx: 1, val: '72', label: 'Giải Bảy 2' },
        { key: 'prize_7', idx: 2, val: '73', label: 'Giải Bảy 3' },
        { key: 'prize_7', idx: 3, val: '74', label: 'Giải Bảy 4' },
        { key: 'special_prize', idx: 0, val: '88888', label: 'Đặc Biệt' },
    ];

    // Current State Tracker
    let currentData = {
        prize_2: [],
        prize_3: [],
        prize_4: [],
        prize_5: [],
        prize_6: [],
        prize_7: []
    }

    // 4. Loop
    for (const step of sequence) {
        console.log(`⏳ Rolling... (Waiting for ${step.label})`);

        // Wait 4s (simulating rolling time during which user sees spinning cursor)
        await new Promise(r => setTimeout(r, 4000));

        // Update Data
        if (['prize_1', 'special_prize'].includes(step.key)) {
            await query(`UPDATE xsmb_results SET ${step.key} = ? WHERE draw_date = ?`, [step.val, today]);
        } else {
            // Array update
            currentData[step.key][step.idx] = step.val;
            await query(`UPDATE xsmb_results SET ${step.key} = ? WHERE draw_date = ?`, [JSON.stringify(currentData[step.key]), today]);
        }

        console.log(`✅ Revealed: ${step.label} [${step.val}]`);
    }

    console.log('🏁 Simulation Complete!');
}

simulateLive().catch(console.error);
