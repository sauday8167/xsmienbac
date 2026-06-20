import 'tsconfig-paths/register';
import { query, closePool } from '../src/lib/db';
import { getOrUpdateBacNhoData } from '../src/lib/bac-nho-cache-service';
import { analyzeBacNhoCap2 } from '../src/lib/bac-nho-cap-2';
import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNho2Ngay } from '../src/lib/bac-nho-2-ngay';
import { analyzeBacNho3Ngay } from '../src/lib/bac-nho-3-ngay';

// Tính sẵn (cache) phân tích bạc nhớ cho 30 kỳ gần nhất, lưu theo từng ngày.
// Chạy 1 lần để khi người dùng chọn ngày trong 30 ngày sẽ hiện ngay (không tính lại live).
async function main() {
    const DAYS_BACK = 30;
    const rows = await query<{ draw_date: string }[]>(
        'SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT ?',
        [DAYS_BACK]
    );

    const sources = [
        { key: 'cap-2', fn: analyzeBacNhoCap2 },
        { key: 'cap-3', fn: analyzeBacNhoCap3 },
        { key: '2-ngay', fn: analyzeBacNho2Ngay },
        { key: '3-ngay', fn: analyzeBacNho3Ngay },
    ];

    console.log(`Backfill bạc nhớ cho ${rows.length} ngày gần nhất...`);
    const t0 = Date.now();

    for (const { draw_date } of rows) {
        for (const s of sources) {
            const start = Date.now();
            try {
                await getOrUpdateBacNhoData(s.key, (d) => (s.fn as any)(d, draw_date), 100, draw_date);
                process.stdout.write(`✅ ${s.key} @ ${draw_date} (${((Date.now() - start) / 1000).toFixed(1)}s)\n`);
            } catch (e: any) {
                console.error(`❌ ${s.key} @ ${draw_date}: ${e.message}`);
            }
        }
    }

    console.log(`Hoàn tất backfill trong ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    try { await (closePool as any)?.(); } catch { }
    process.exit(0);
}

main().catch((e) => { console.error('Backfill failed:', e); process.exit(1); });
