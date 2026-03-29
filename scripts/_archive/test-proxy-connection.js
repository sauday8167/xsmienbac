const axios = require('axios');

async function testProxy() {
    // User provided proxy
    const proxyUrl = 'http://PyPxavXb:F5GZ0aNrS1@42.96.13.117:10020';
    console.log('Testing proxy:', proxyUrl);

    let proxyConfig;
    try {
        const url = new URL(proxyUrl);
        proxyConfig = {
            protocol: url.protocol.replace(':', ''),
            host: url.hostname,
            port: parseInt(url.port),
            auth: {
                username: url.username,
                password: url.password
            }
        };
    } catch (e) {
        console.error('Invalid URL format');
        return;
    }

    const targets = [
        'http://httpbin.org/ip',
        'http://example.com',
        'https://www.google.com'
    ];

    for (const target of targets) {
        console.log(`\n--- Testing target: ${target} ---`);
        try {
            const start = Date.now();
            const response = await axios.get(target, {
                proxy: proxyConfig,
                timeout: 10000 // 10s
            });
            const duration = Date.now() - start;
            console.log(`✅ Success! Status: ${response.status}`);
            console.log(`   Time: ${duration}ms`);
            if (target.includes('httpbin')) {
                console.log(`   IP Returned:`, response.data);
            }
        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            if (error.response) {
                console.error(`   Response Status: ${error.response.status}`);
                console.error(`   Response Data:`, error.response.data);
            }
        }
    }
}

testProxy();
