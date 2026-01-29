const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
    return env;
}

async function migrate() {
    const env = parseEnv(path.resolve(process.cwd(), '.env.local'));

    const config = {
        host: env.DB_HOST || 'localhost',
        user: env.DB_USER || 'root',
        password: env.DB_PASSWORD || '',
        database: env.DB_NAME || 'xsmb_lottery',
        port: parseInt(env.DB_PORT || '3306'),
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database...');

        try {
            await connection.query("ALTER TABLE admins ADD COLUMN avatar VARCHAR(500) AFTER email");
            console.log('Successfully added avatar column to admins table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column avatar already exists');
            } else {
                throw e;
            }
        }

        await connection.end();
    } catch (error) {
        // Graceful exit if DB is unreachable
        console.log('Could not connect to database (might be offline). Run this script again when DB is running.');
    }
}

migrate();
