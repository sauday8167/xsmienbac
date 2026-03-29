/**
 * Test script for Multi-API Racing System
 * Run: node scripts/test-racing-system.js
 */

const axios = require('axios');

// Test individual API endpoints
async function testIndividualAPIs() {
    console.log('🧪 Testing Individual API Crawlers...\n');

    const apis = [
        { name: 'API 3 (kqxs.vn)', url: 'https://www.kqxs.vn/realtime/mien-bac.html' },
        { name: 'API 4 (xskt.com.vn)', url: 'https://ttttmb.xskt.com.vn/zzz/ttttxs-s.jsp?areaCode=MB&s=0' },
        { name: 'API 6 (mketqua.net)', url: 'https://data.mketqua.net/pre_loads/kq-mb.raw' },
        { name: 'API 7 (ketqua04.net)', url: 'https://data.ketqua04.net/pre_loads/kq-mb.raw' },
    ];

    for (const api of apis) {
        try {
            const startTime = Date.now();
            const response = await axios.get(api.url + `?t=${Date.now()}`, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const duration = Date.now() - startTime;

            console.log(`✅ ${api.name}: ${duration}ms`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Data length: ${JSON.stringify(response.data).length} chars`);
            console.log('');
        } catch (error) {
            console.log(`❌ ${api.name}: Failed`);
            console.log(`   Error: ${error.message}`);
            console.log('');
        }
    }
}

// Test cron endpoint
async function testCronEndpoint() {
    console.log('\n🔧 Testing Cron Endpoint...\n');

    const cronSecret = process.env.CRON_SECRET || 'your-super-secret-cron-key-change-this-in-production';

    try {
        const startTime = Date.now();
        const response = await axios.get('http://localhost:3000/api/cron/update-live-results', {
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            },
            timeout: 30000
        });
        const duration = Date.now() - startTime;

        console.log(`✅ Cron Endpoint: ${duration}ms`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log(`❌ Cron Endpoint: Failed`);
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
        }
    }
}

// Test unauthorized access
async function testUnauthorized() {
    console.log('\n🔒 Testing Unauthorized Access...\n');

    try {
        const response = await axios.get('http://localhost:3000/api/cron/update-live-results', {
            headers: {
                'Authorization': 'Bearer wrong-secret'
            },
            timeout: 5000
        });
        console.log(`❌ Should have failed but got: ${response.status}`);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log(`✅ Correctly rejected unauthorized request (401)`);
        } else {
            console.log(`❌ Unexpected error: ${error.message}`);
        }
    }
}

// Main test runner
async function runTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Multi-API Racing System - Test Suite');
    console.log('═══════════════════════════════════════════════════════\n');

    await testIndividualAPIs();
    await testCronEndpoint();
    await testUnauthorized();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Test Complete!');
    console.log('═══════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
