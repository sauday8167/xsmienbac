import { query } from '../src/lib/db';
import { LotteryResultRaw, extractAllLotoNumbers } from '../src/lib/lottery-helpers';

interface BacktestResult {
    methodName: string;
    totalTests: number;
    totalHits: number;
    winRate: number;
    predictions: Array<{
        date: string;
        predicted: string[];
        actual: string[];
        hit: boolean;
    }>;
}

// Helper: Check if any predicted number appears in actual loto numbers
function checkHit(predicted: string[], actual: string[]): boolean {
    return predicted.some(p => actual.includes(p));
}

async function backtestNewMethods() {
    console.log('=== BACKTEST 3 PHƯƠNG PHÁP AI MỚI ===\n');

    // Lấy 100 ngày dữ liệu gần nhất
    const sql = `
        SELECT * FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT 100
    `;
    const results = await query<LotteryResultRaw[]>(sql, []);

    if (results.length < 10) {
        console.log('❌ Không đủ dữ liệu để backtest (cần ít nhất 10 ngày)');
        return;
    }

    console.log(`📊 Đang backtest với ${results.length} ngày dữ liệu...\n`);

    const method1Results: BacktestResult = {
        methodName: 'Cầu Lùi Ngày (D-2)',
        totalTests: 0,
        totalHits: 0,
        winRate: 0,
        predictions: []
    };

    const method2Results: BacktestResult = {
        methodName: 'Đầu Đặc - Đuôi Lô',
        totalTests: 0,
        totalHits: 0,
        winRate: 0,
        predictions: []
    };

    const method3Results: BacktestResult = {
        methodName: 'Ma Trận Chéo Giải',
        totalTests: 0,
        totalHits: 0,
        winRate: 0,
        predictions: []
    };

    // Bắt đầu từ ngày thứ 3 (index 2) vì cần D-2
    for (let i = 2; i < results.length; i++) {
        const today = results[i];
        const yesterday = results[i - 1];
        const dayMinus2 = results[i - 2];

        // Lấy tất cả loto của ngày today (để check hit)
        const actualLoto = extractAllLotoNumbers(today);

        // === PHƯƠNG PHÁP 1: Cầu Lùi Ngày ===
        try {
            const gdbD2 = String(dayMinus2.special_prize || '').slice(-2);
            const g7D2Raw = dayMinus2.prize_7;
            let g7D2: string[] = [];

            if (typeof g7D2Raw === 'string') {
                try {
                    g7D2 = JSON.parse(g7D2Raw);
                } catch {
                    g7D2 = [];
                }
            } else if (Array.isArray(g7D2Raw)) {
                g7D2 = g7D2Raw;
            }

            if (g7D2.length > 0 && gdbD2.length === 2) {
                const firstG7 = String(g7D2[0])[0];
                const reverseNum1 = (firstG7 + gdbD2[0]).padStart(2, '0');
                const reverseNum2 = gdbD2;
                const predicted = [reverseNum1, reverseNum2];
                const hit = checkHit(predicted, actualLoto);

                method1Results.totalTests++;
                if (hit) method1Results.totalHits++;

                method1Results.predictions.push({
                    date: today.draw_date,
                    predicted,
                    actual: actualLoto.slice(0, 5), // Chỉ show 5 số đầu
                    hit
                });
            }
        } catch (error) {
            // Skip error
        }

        // === PHƯƠNG PHÁP 2: Đầu Đặc - Đuôi Lô ===
        try {
            const headGDB = String(yesterday.special_prize || '')[0];
            const g7YesterdayRaw = yesterday.prize_7;
            let g7Yesterday: string[] = [];

            if (typeof g7YesterdayRaw === 'string') {
                try {
                    g7Yesterday = JSON.parse(g7YesterdayRaw);
                } catch {
                    g7Yesterday = [];
                }
            } else if (Array.isArray(g7YesterdayRaw)) {
                g7Yesterday = g7YesterdayRaw;
            }

            if (g7Yesterday.length > 0 && headGDB) {
                const lastG7 = String(g7Yesterday[g7Yesterday.length - 1]);
                const tailG7 = lastG7[lastG7.length - 1];
                const crossNum = (headGDB + tailG7).padStart(2, '0');
                const predicted = [crossNum];
                const hit = checkHit(predicted, actualLoto);

                method2Results.totalTests++;
                if (hit) method2Results.totalHits++;

                method2Results.predictions.push({
                    date: today.draw_date,
                    predicted,
                    actual: actualLoto.slice(0, 5),
                    hit
                });
            }
        } catch (error) {
            // Skip error
        }

        // === PHƯƠNG PHÁP 3: Ma Trận Chéo Giải ===
        try {
            const g1Str = String(yesterday.prize_1 || '');
            const g4Raw = yesterday.prize_4;
            let g4Arr: string[] = [];

            if (typeof g4Raw === 'string') {
                try {
                    g4Arr = JSON.parse(g4Raw);
                } catch {
                    g4Arr = [];
                }
            } else if (Array.isArray(g4Raw)) {
                g4Arr = g4Raw;
            }

            if (g1Str.length >= 2 && g4Arr.length > 0) {
                const digit2G1 = parseInt(g1Str[1]);
                const g4FirstStr = String(g4Arr[0]);
                const digit3G4 = g4FirstStr.length >= 3 ? parseInt(g4FirstStr[2]) : 0;
                const sum = (digit2G1 + digit3G4) % 10;
                const matrixNum = (sum.toString() + digit2G1.toString()).padStart(2, '0');
                const matrixNumReverse = (digit2G1.toString() + sum.toString()).padStart(2, '0');
                const predicted = [matrixNum, matrixNumReverse];
                const hit = checkHit(predicted, actualLoto);

                method3Results.totalTests++;
                if (hit) method3Results.totalHits++;

                method3Results.predictions.push({
                    date: today.draw_date,
                    predicted,
                    actual: actualLoto.slice(0, 5),
                    hit
                });
            }
        } catch (error) {
            // Skip error
        }
    }

    // Tính win rate
    method1Results.winRate = method1Results.totalTests > 0
        ? (method1Results.totalHits / method1Results.totalTests) * 100
        : 0;
    method2Results.winRate = method2Results.totalTests > 0
        ? (method2Results.totalHits / method2Results.totalTests) * 100
        : 0;
    method3Results.winRate = method3Results.totalTests > 0
        ? (method3Results.totalHits / method3Results.totalTests) * 100
        : 0;

    // In kết quả
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║              KẾT QUẢ BACKTEST - TỶ LỆ TRÚNG              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    [method1Results, method2Results, method3Results].forEach((result, idx) => {
        const icon = result.winRate >= 30 ? '🔥' : result.winRate >= 20 ? '✅' : '⚠️';
        console.log(`${icon} PHƯƠNG PHÁP ${idx + 1}: ${result.methodName}`);
        console.log(`   📈 Tỷ lệ trúng: ${result.winRate.toFixed(2)}%`);
        console.log(`   📊 Số lần test: ${result.totalTests}`);
        console.log(`   ✅ Số lần trúng: ${result.totalHits}`);
        console.log(`   ❌ Số lần trượt: ${result.totalTests - result.totalHits}`);
        console.log('');

        // Show 5 dự đoán gần nhất
        console.log('   📋 5 Dự đoán gần đây:');
        result.predictions.slice(0, 5).forEach((p, i) => {
            const status = p.hit ? '✅ TRÚNG' : '❌ TRƯỢT';
            console.log(`      ${i + 1}. ${p.date}: [${p.predicted.join(', ')}] → ${status}`);
        });
        console.log('\n' + '─'.repeat(60) + '\n');
    });

    // Kết luận
    console.log('💡 KẾT LUẬN:');
    const bestMethod = [method1Results, method2Results, method3Results]
        .sort((a, b) => b.winRate - a.winRate)[0];
    console.log(`   🏆 Phương pháp tốt nhất: ${bestMethod.methodName}`);
    console.log(`   📈 Tỷ lệ: ${bestMethod.winRate.toFixed(2)}%`);

    if (bestMethod.winRate < 20) {
        console.log('\n⚠️  CẢNH BÁO: Tất cả phương pháp đều có tỷ lệ thấp (<20%).');
        console.log('   → Có thể cần điều chỉnh công thức hoặc kết hợp nhiều phương pháp.');
    } else if (bestMethod.winRate >= 30) {
        console.log('\n🔥 XUẤT SẮC: Có phương pháp đạt tỷ lệ >= 30%!');
        console.log('   → Nên triển khai phương pháp này lên production.');
    }
}

// Run backtest
backtestNewMethods().catch(console.error);
