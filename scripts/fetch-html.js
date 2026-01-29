const axios = require('axios');
const fs = require('fs');

async function run() {
    const url = 'https://www.minhngoc.net.vn/ket-qua-xo-so/mien-bac/08-01-2026.html';
    console.log(`Fetching ${url}...`);
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        fs.writeFileSync('debug_page.html', response.data);
        console.log('Saved to debug_page.html');
    } catch (e) {
        console.error(e.message);
    }
}
run();
