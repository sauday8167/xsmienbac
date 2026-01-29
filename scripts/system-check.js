// End of Day System Check
const { query } = require('./src/lib/db');

async function systemCheck() {
    console.log('🔍 KIỂM TRA HỆ THỐNG CUỐI NGÀY');
    console.log('='.repeat(60));
    console.log('');

    try {
        // 1. Check lottery results data
        console.log('1️⃣ KIỂM TRA DỮ LIỆU KẾT QUẢ XỔ SỐ');
        console.log('-'.repeat(60));
        const results = await query(`
            SELECT draw_date, special_prize, prize_1 
            FROM xsmb_results 
            WHERE draw_date >= '2026-01-14' 
            ORDER BY draw_date DESC
        `);
        console.log(`   ✅ Tổng số ngày có data: ${results.length}`);
        results.forEach(r => {
            console.log(`   📅 ${r.draw_date}: GĐB=${r.special_prize}, G1=${r.prize_1}`);
        });
        console.log('');

        // 2. Check AI predictions
        console.log('2️⃣ KIỂM TRA DỰ ĐOÁN AI');
        console.log('-'.repeat(60));
        const predictions = await query(`
            SELECT draw_date, confidence_score, created_at 
            FROM ai_predictions 
            ORDER BY draw_date DESC 
            LIMIT 5
        `);
        console.log(`   ✅ Tổng số predictions: ${predictions.length}`);
        predictions.forEach(p => {
            console.log(`   🤖 ${p.draw_date}: Confidence=${p.confidence_score}%, Created=${p.created_at}`);
        });
        console.log('');

        // 3. Check blog posts
        console.log('3️⃣ KIỂM TRA BÀI VIẾT');
        console.log('-'.repeat(60));
        const posts = await query(`
            SELECT COUNT(*) as total FROM posts WHERE status = 'published'
        `);
        console.log(`   ✅ Tổng số bài viết published: ${posts[0].total}`);
        console.log('');

        // 4. Check menu items
        console.log('4️⃣ KIỂM TRA MENU');
        console.log('-'.repeat(60));
        const menus = await query(`
            SELECT COUNT(*) as total FROM menu_items
        `);
        console.log(`   ✅ Tổng số menu items: ${menus[0].total}`);
        console.log('');

        // 5. Summary
        console.log('📊 TÓM TẮT');
        console.log('='.repeat(60));
        console.log(`   ✅ Dữ liệu xổ số: ${results.length} ngày (${results[0]?.draw_date} → ${results[results.length - 1]?.draw_date})`);
        console.log(`   ✅ AI predictions: ${predictions.length} records`);
        console.log(`   ✅ Blog posts: ${posts[0].total} published`);
        console.log(`   ✅ Menu items: ${menus[0].total} items`);
        console.log('');

        // 6. Recommendations
        console.log('💡 KHUYẾN NGHỊ');
        console.log('='.repeat(60));

        if (predictions.length === 0 || predictions[0].confidence_score < 50) {
            console.log('   ⚠️  AI prediction cần được regenerate với data đầy đủ');
        } else {
            console.log('   ✅ AI prediction hoạt động tốt');
        }

        if (results.length < 7) {
            console.log('   ⚠️  Nên có thêm data lịch sử (tối thiểu 7 ngày)');
        } else {
            console.log('   ✅ Data lịch sử đầy đủ');
        }

        console.log('');
        console.log('✅ KIỂM TRA HOÀN TẤT!');
        console.log('');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

systemCheck();
