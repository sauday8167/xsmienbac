import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import * as XLSX from 'xlsx';

// Helper: Parse Excel date serial number to string "YYYY-MM-DD"
function parseExcelDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date = new Date(utc_value * 1000);
    return date.toISOString().split('T')[0];
}

// Normalize array or string to JSON string
function formatPrize(val: any): string {
    if (!val) return '[]'; // Default empty array
    if (typeof val === 'string') {
        // Try to see if it's comma separated or already valid json?
        // Assuming Excel might have comma separated for multiple prizes like "12, 34" or newlines
        // If it looks like JSON array "[...]", keep it.
        // If just plain string "123", return ["123"] logic?
        // Let's assume user inputs comma separated or space separated for multiple prizes in one cell
        // BUT strict format is best. Let's try to split by comma or dash
        if (val.trim().startsWith('[')) return val;
        const parts = val.toString().split(/[\s,-]+/).filter((x: string) => x.trim().length > 0);
        return JSON.stringify(parts);
    }
    return JSON.stringify([val.toString()]);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON with header: 1 to get raw rows as arrays
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        /* Expected Excel Column structure (index-based):
           0: Ngày (DD/MM/YYYY)
           1: Đặc biệt
           2: Giải nhất
           3: Giải nhì
           4: Giải ba
           5: Giải bốn
           6: Giải năm
           7: Giải sáu
           8: Giải bảy
        */

        let successCount = 0;
        let errors = [];

        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const dateVal = row[0];
            const special = row[1];
            const p1 = row[2];
            const p2 = row[3];
            const p3 = row[4];
            const p4 = row[5];
            const p5 = row[6];
            const p6 = row[7];
            const p7 = row[8];

            if (!dateVal || !special) {
                continue; // Skip rows without date or special prize
            }

            let drawDateStr = '';
            if (typeof dateVal === 'number') {
                drawDateStr = parseExcelDate(dateVal);
            } else if (typeof dateVal === 'string') {
                // Handle DD/MM/YYYY
                const parts = dateVal.split('/');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];
                    drawDateStr = `${year}-${month}-${day}`;
                } else {
                    const d = new Date(dateVal);
                    if (!isNaN(d.getTime())) {
                        drawDateStr = d.toISOString().split('T')[0];
                    }
                }
            }

            if (!drawDateStr) continue;

            try {
                // Using REPLACE INTO or INSERT ... ON DUPLICATE KEY for SQLite
                // SQLite doesn't have ON DUPLICATE KEY, it has INSERT OR REPLACE or ON CONFLICT
                await query(
                    `INSERT INTO xsmb_results 
                    (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(draw_date) DO UPDATE SET
                    special_prize=excluded.special_prize,
                    prize_1=excluded.prize_1,
                    prize_2=excluded.prize_2,
                    prize_3=excluded.prize_3,
                    prize_4=excluded.prize_4,
                    prize_5=excluded.prize_5,
                    prize_6=excluded.prize_6,
                    prize_7=excluded.prize_7`,
                    [
                        drawDateStr,
                        special.toString().trim(),
                        p1 ? p1.toString().trim() : '',
                        formatPrize(p2),
                        formatPrize(p3),
                        formatPrize(p4),
                        formatPrize(p5),
                        formatPrize(p6),
                        formatPrize(p7)
                    ]
                );
                successCount++;
            } catch (err: any) {
                errors.push(`Dòng ${i + 1} (${drawDateStr}): ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Đã nhập ${successCount} hàng thành công.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
