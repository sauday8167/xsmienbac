const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function insertMockPrediction() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'xsmb_lottery'
        });

        const targetDate = new Date().toISOString().split('T')[0]; // Today

        const mockPredictedPairs = JSON.stringify(['24', '68', '05', '77', '93']);
        const mockAnalysisContent = `# Phân Tích AI - Ngày ${targetDate}

## Xu Hướng Số Liệu

Dựa trên phân tích dữ liệu lịch sử 100 ngày gần đây, hệ thống nhận diện được các xu hướng sau:

### Top 5 Số Tiềm Năng
- **24**: Chu kỳ xuất hiện 4-5 ngày, độ phủ cao
- **68**: Cặp số nóng trong tuần, tần suất tăng
- **05**: Đầu 0 - đuôi 5 đang trong chu kỳ mạnh
- **77**: Số đôi có xu hướng lặp lại
- **93**: Đầu 9 xuất hiện liên tiếp 3 phiên

## Phân Tích Chi Tiết

**Tần Suất Xuất Hiện:**
- Các số trong top 5 đều có tần suất xuất hiện cao trong 2 tuần qua
- Đặc biệt chú ý: Đầu 2, đầu 6, đầu 0 đang ở chu kỳ mạnh

**Xu Hướng Lặp:**
- Cặp số 24-68 thường xuất hiện cùng nhau
- Dãy số 77-93 có mối liên kết trong lịch sử

## Khuyến Nghị

Đây là phân tích tham khảo dựa trên dữ liệu thống kê. Chúc bạn may mắn!`;

        const confidence = 72; // 72%

        // Delete existing prediction for today if any
        await connection.execute(
            'DELETE FROM ai_predictions WHERE draw_date = ?',
            [targetDate]
        );

        // Insert new mock prediction
        await connection.execute(
            `INSERT INTO ai_predictions 
            (draw_date, analysis_content, predicted_pairs, confidence_score, model_used, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                targetDate,
                mockAnalysisContent,
                mockPredictedPairs,
                confidence,
                'gemini-2.5-flash (mock)',
                new Date().toISOString()
            ]
        );

        console.log('✅ Mock prediction inserted successfully!');
        console.log('Target Date:', targetDate);
        console.log('Predicted Pairs:', mockPredictedPairs);
        console.log('Confidence:', confidence + '%');
        console.log('\nYou can now view it at: http://localhost:3000/du-doan-ai');

    } catch (error) {
        console.error('❌ Error inserting mock prediction:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

insertMockPrediction();
