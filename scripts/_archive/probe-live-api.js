const axios = require('axios');

async function probe() {
    try {
        console.log('Fetching https://live.xoso.com.vn/lotteryLive/MB...');
        const response = await axios.get('https://live.xoso.com.vn/lotteryLive/MB', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://xoso.com.vn/'
            }
        });

        console.log('Status:', response.status);
        console.log('Data Type:', typeof response.data);
        console.log('Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

probe();
