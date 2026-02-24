const fetch = require('node-fetch'); // Ensure node-fetch is installed or use native fetch in node 18+

async function runMockDraw() {
    try {
        console.log(`[${new Date().toISOString()}] Bắt đầu chạy Quay Mô Phỏng...`);
        // Use native fetch if Node version >= 18, fallback to node-fetch if needed for older versions.
        const res = await globalThis.fetch('http://localhost:3000/api/quay-mo-phong/run', {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${process.env.CRON_SECRET}` // Ensure environment is loaded or passing parameter if applied
            }
        });

        const data = await res.json();

        if (data.success) {
            console.log(`[${new Date().toISOString()}] Thành công! Đã chạy ${data.data.total_runs} lần mô phỏng.`);
        } else {
            console.error(`[${new Date().toISOString()}] Lỗi từ server:`, data.error);
        }
    } catch (e) {
        console.error(`[${new Date().toISOString()}] Lỗi khi gọi API:`, e);
    }
}

// Run the script
runMockDraw();
