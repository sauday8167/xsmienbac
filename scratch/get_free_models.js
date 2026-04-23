
const https = require('https');

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/models',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer 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'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const freeModels = json.data.filter(m => m.id.endsWith(':free'));
            console.log(JSON.stringify(freeModels.map(m => m.id), null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.end();
