
import { query } from './db';

export interface BacNhoSpecialResult {
    number: string;
    count: number;
    probability: number;
}

export class BacNhoSpecial {
    /**
     * Lấy 27 số từ một kết quả XSMB (2 số cuối)
     */
    private static extract27Lotos(result: any): string[] {
        const lotos: string[] = [];
        const prizeKeys = [
            'special_prize', 'prize_1', 'prize_2', 'prize_3',
            'prize_4', 'prize_5', 'prize_6', 'prize_7'
        ];

        prizeKeys.forEach(key => {
            const val = result[key];
            if (!val) return;
            try {
                const prizes = val.startsWith('[') ? JSON.parse(val) : [val];
                prizes.forEach((p: any) => {
                    const s = String(p);
                    if (s.length >= 2) lotos.push(s.slice(-2));
                });
            } catch (e) {
                const s = String(val);
                if (s.length >= 2) lotos.push(s.slice(-2));
            }
        });
        return lotos;
    }

    /**
     * Tính tổ hợp chập 3 của n: nC3
     */
    private static combinations27C3(n: number): number {
        if (n < 3) return 0;
        return (n * (n - 1) * (n - 2)) / 6;
    }

    /**
     * Phân tích Bạc Nhớ Đặc Biệt cho một ngày cụ thể
     * @param drawDate Ngày làm mốc để lấy dự đoán (dựa trên kết quả ngày này để dự đoán ngày sau)
     * @param mode 'today' (1 ngày tiếp theo) hoặc 'khung' (3 ngày tiếp theo)
     */
    static async analyzeForDate(drawDate: string, mode: 'today' | 'khung' = 'today'): Promise<{ data: BacNhoSpecialResult[], baseDate: string }> {
        // 1. Lấy kỳ quay baseDate làm dữ liệu gốc
        const latestDraw = await queryOne<any>(
            'SELECT * FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 1',
            [drawDate]
        );
        if (!latestDraw) return { data: [], baseDate: '' };

        const targetLotos = this.extract27Lotos(latestDraw);
        
        // 2. Lấy dữ liệu 1 năm gần nhất tính từ baseDate
        const history = await query<any[]>(
            `SELECT * FROM xsmb_results 
             WHERE draw_date < ? 
             ORDER BY draw_date DESC`,
             [latestDraw.draw_date]
        );

        const frequencyMap: Record<string, number> = {};
        for (let i = 0; i < 100; i++) frequencyMap[i.toString().padStart(2, '0')] = 0;

        // 3. Duyệt qua từng ngày trong lịch sử (365 kỳ)
        const analysisRange = history.slice(0, 365);

        // Chuẩn bị counts cho targetLotos để so khớp nhanh hơn
        const currentLotoCounts: Record<string, number> = {};
        targetLotos.forEach(l => currentLotoCounts[l] = (currentLotoCounts[l] || 0) + 1);

        for (let i = 0; i < analysisRange.length; i++) {
            const historyDraw = analysisRange[i];
            const historyLotos = this.extract27Lotos(historyDraw);
            
            const historyLotoCounts: Record<string, number> = {};
            historyLotos.forEach(l => historyLotoCounts[l] = (historyLotoCounts[l] || 0) + 1);

            let matchingPairs = 0;
            Object.keys(currentLotoCounts).forEach(l => {
                if (historyLotoCounts[l]) {
                    matchingPairs += Math.min(currentLotoCounts[l], historyLotoCounts[l]);
                }
            });

            const weight = this.combinations27C3(matchingPairs);

            if (weight > 0) {
                const lookahead = mode === 'today' ? 1 : 3;
                for (let j = 1; j <= lookahead; j++) {
                    const futureIdx = i - j;
                    if (futureIdx >= 0) {
                        const futureDraw = history[futureIdx];
                        const gdb = futureDraw.special_prize.slice(-2);
                        frequencyMap[gdb] += weight;
                    }
                }
            }
        }

        const totalOccurrences = Object.values(frequencyMap).reduce((a, b) => a + b, 0);
        
        const data = Object.entries(frequencyMap)
            .map(([number, count]) => ({
                number,
                count,
                probability: totalOccurrences > 0 ? (count / totalOccurrences) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 36);

        return { data, baseDate: latestDraw.draw_date };
    }

    /**
     * Mặc định là analyze cho ngày gần nhất
     */
    static async analyze(mode: 'today' | 'khung' = 'today'): Promise<{ data: BacNhoSpecialResult[], baseDate: string }> {
        const latestDraw = await queryOne<any>('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        if (!latestDraw) return { data: [], baseDate: '' };
        return this.analyzeForDate(latestDraw.draw_date, mode);
    }
}

async function queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await query<T[]>(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
