const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function testGemini() {
    console.log('--- Testing Gemini 1.5 Flash Accessibility ---');
    
    let db = await open({
        filename: './database/xsmb.sqlite',
        driver: sqlite3.Database
    });

    const keyRecord = await db.get("SELECT key FROM api_keys WHERE provider = 'gemini' AND status = 'active' LIMIT 1");
    await db.close();

    const apiKey = keyRecord ? keyRecord.key : process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.error('Error: No active Gemini API key found.');
        return;
    }

    // Correct model name format for Gemini 1.5 Flash
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say "Gemini is READY!"' }] }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('SUCCESS');
            console.log('Response:', data.candidates[0].content.parts[0].text);
        } else {
            const err = await response.json();
            console.log(`FAILURE (${response.status})`);
            console.log(`   Error: ${err.error.message}`);
        }
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
    }
}

testGemini();
