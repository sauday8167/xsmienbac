const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const env = {};
try {
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const parts = line.split('=');
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                env[key] = value;
            }
        });
    }
} catch (e) {
    console.warn('Could not read .env.local file');
}

async function setupDatabase() {
    try {
        console.log('Starting full database setup...');
        console.log('Reading database configuration...');

        const host = env.DB_HOST || process.env.DB_HOST || 'localhost';
        const user = env.DB_USER || process.env.DB_USER || 'root';
        const password = env.DB_PASSWORD || process.env.DB_PASSWORD || '';
        const database = env.DB_NAME || process.env.DB_NAME || 'xsmb_lottery';

        // Check connection
        console.log(`Attempting connection to ${host} as ${user}...`);

        // Create connection
        const connection = await mysql.createConnection({
            host,
            user,
            password,
            multipleStatements: true // Enable multiple statements
        });

        console.log(`Connected to MySQL host: ${host}`);

        // Read schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');

        // Execute schema
        await connection.query(schema);

        console.log('Database setup completed successfully!');
        console.log(`- Database: ${database}`);
        console.log('- Tables created: posts, admins, xsmb_results, statistics_cache');
        console.log('- Default admin created: admin / admin123');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
