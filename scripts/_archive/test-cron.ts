import 'dotenv/config';

async function test() {
    const secret = process.env.CRON_SECRET;
    console.log('[Test] Secret:', secret ? '***' + secret.slice(-4) : 'Missing');

    try {
        const res = await fetch('http://localhost:3000/api/cron/run-so-hot', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${secret}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            cache: 'no-store'
        });

        const data = await res.json();
        console.log('[Test API run-so-hot] Status:', res.status);
        console.log('[Test API run-so-hot] Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
