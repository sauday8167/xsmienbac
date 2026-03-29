
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/ai/run-prediction',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': 2
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write('{}');
req.end();
