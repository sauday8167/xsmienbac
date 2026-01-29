const https = require('https');

const BASE_URL = 'https://xosomienbac24h.com';
const URLS = [
    '/',
    '/ket-qua-theo-ngay',
    '/thong-ke',
    '/soi-cau-bac-nho',
    '/bac-nho-khung-3-ngay',
    '/tin-tuc',
    '/api/bac-nho',
    '/api/posts'
];

// URLs that MUST NOT exist (should 404 or redirect)
const FORBIDDEN_URLS = [
    // '/bac-nho' // Actually user removed the menu item, but route might still exist or 404. Let's check status.
];

async function checkUrl(path) {
    return new Promise((resolve) => {
        const url = `${BASE_URL}${path}`;
        const req = https.get(url, (res) => {
            console.log(`[${res.statusCode}] ${path}`);
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve(true);
            } else {
                console.error(`  FAIL: ${url} returned ${res.statusCode}`);
                resolve(false);
            }
        });
        req.on('error', (e) => {
            console.error(`  ERROR: ${url} - ${e.message}`);
            resolve(false);
        });
    });
}

async function verify() {
    console.log('--- Verifying Live Site ---');
    let success = true;
    for (const url of URLS) {
        const ok = await checkUrl(url);
        if (!ok) success = false;
    }

    // Check for removed Bac Nho Link in Homepage HTML
    console.log('--- Checking for Bac Nho Link removal ---');
    const homeHtml = await new Promise(resolve => {
        https.get(BASE_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
    });

    if (homeHtml.includes('href="/bac-nho"')) {
        console.error('FAIL: Homepage still contains link to /bac-nho');
        success = false;
    } else {
        console.log('PASS: Homepage does not contain /bac-nho link');
    }

    if (success) {
        console.log('--- All Checks Passed ---');
        process.exit(0);
    } else {
        console.error('--- Some Checks Failed ---');
        process.exit(1);
    }
}

verify();
