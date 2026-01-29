
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');

function getKeyFromDb() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) return reject(err);
        });

        db.get(
            `SELECT key FROM api_keys WHERE status = 'active' AND provider = 'gemini' ORDER BY last_used ASC LIMIT 1`,
            (err, row) => {
                db.close();
                if (err) return reject(err);
                resolve(row ? row.key : null);
            }
        );
    });
}

async function testGemini() {
    console.log('--- Testing Gemini API (using DB Key) ---');

    try {
        const apiKey = await getKeyFromDb();
        if (!apiKey) {
            console.error('❌ No active Gemini key found in database.');
            return;
        }
        console.log(`Key found in DB: ${apiKey.substring(0, 8)}...`);

        const genAI = new GoogleGenerativeAI(apiKey);

        // Testing gemini-2.5-flash
        const modelName = 'gemini-2.5-flash';
        console.log(`Attempting with model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, return 'OK' if you work.");
        const response = await result.response;
        console.log('✅ Gemini Response:', response.text());

    } catch (error) {
        console.error('❌ Gemini Failed:', error.message);
        if (error.response) console.error('Details:', JSON.stringify(error.response, null, 2));
    }
}

testGemini();
