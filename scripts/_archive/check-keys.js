const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkKeys() {
    console.log('--- DIAGNOSTIC START ---');
    try {
        const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
        console.log(`Open DB: ${dbPath}`);

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // 1. Check Tables
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.map(t => t.name).join(', '));

        if (!tables.find(t => t.name === 'api_keys')) {
            console.error('❌ ERROR: Table "api_keys" does not exist!');
            return;
        }

        // 2. Check Keys
        const keys = await db.all("SELECT * FROM api_keys");
        console.log('\n--- API KEYS IN DB ---');
        console.table(keys);

        if (keys.length === 0) {
            console.warn('⚠️  No keys found in database.');
        } else {
            const activeGemini = keys.find(k => k.status === 'active' && (k.provider === 'gemini' || !k.provider));
            if (activeGemini) {
                console.log('✅ Found active Gemini key:', activeGemini.key.substring(0, 10) + '...');
            } else {
                console.error('❌ No ACTIVE Gemini key found.');
            }
        }

        // 3. Check Env
        console.log('\n--- ENV VARS ---');
        console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'Set' : 'Not Set');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
    console.log('--- DIAGNOSTIC END ---');
}

checkKeys();
