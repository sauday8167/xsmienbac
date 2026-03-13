
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function verify() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    console.log('--- Statistics Cache Verification ---');
    const types = await db.all('SELECT stat_type, COUNT(*) as count, MAX(stat_key) as latest_date FROM statistics_cache GROUP BY stat_type');
    
    console.table(types);

    const latest = await db.get('SELECT * FROM statistics_cache ORDER BY created_at DESC LIMIT 1');
    if (latest) {
        console.log('\nSample Record:');
        console.log('Type:', latest.stat_type);
        console.log('Date:', latest.stat_key);
        console.log('Data Length:', latest.stat_value.length);
        
        try {
            const data = JSON.parse(latest.stat_value);
            console.log('Data Preview (Overview):', data.overview);
        } catch (e) {
            console.log('Could not parse JSON value.');
        }
    }

    await db.close();
}

verify();
