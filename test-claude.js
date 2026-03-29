const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function testClaudeModels() {
    console.log('--- Testing Claude Model Accessibility ---');
    
    let db;
    try {
        db = await open({
            filename: './database/xsmb.sqlite',
            driver: sqlite3.Database
        });
    } catch (dbError) {
        console.error('Database Error:', dbError.message);
        return;
    }

    const keyRecord = await db.get("SELECT key FROM api_keys WHERE provider = 'claude' AND status = 'active' LIMIT 1");
    await db.close();

    if (!keyRecord) {
        console.error('Error: No active Claude API key found in database.');
        return;
    }

    const apiKey = keyRecord.key;
    const modelsToTest = [
        'claude-3-haiku-20240307',
        'claude-3-5-sonnet-20240620',
        'claude-3-5-sonnet-20241022'
    ];

    for (const model of modelsToTest) {
        process.stdout.write(`Testing ${model}... `);
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 5,
                    messages: [{ role: 'user', content: 'Hi' }]
                })
            });

            if (response.ok) {
                console.log('SUCCESS');
            } else {
                const err = await response.json();
                console.log(`FAILURE (${response.status}: ${err.error.type})`);
                if (err.error.message) console.log(`   Message: ${err.error.message}`);
            }
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
        }
    }
}

testClaudeModels();
