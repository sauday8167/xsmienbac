const axios = require('axios');

async function testStats() {
    try {
        console.log('Testing /api/stats...');
        const res = await axios.get('http://localhost:3000/api/stats');
        console.log('Status:', res.status);
        console.log('Data Success:', res.data.success);
        if (res.data.data) {
            console.log('Lo Gan count:', res.data.data.loGan.length);
            console.log('Top Lo Gan:', res.data.data.loGan[0]);
            console.log('Frequent count:', res.data.data.frequent.length);
            console.log('Top Frequent:', res.data.data.frequent[0]);
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
        }
    }
}

testStats();
