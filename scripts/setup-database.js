const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Simple environment variable loader (reads from .env.local if exists)
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=:#]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnvFile();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
};

const dbName = process.env.DB_NAME || 'xsmb_lottery';

async function setupDatabase() {
    let connection;

    try {
        console.log('🔌 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server successfully!');

        // Read and execute schema
        console.log('\n📋 Creating database and tables...');
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(schema);
        console.log('✅ Database schema created successfully!');

        // Fetch and insert initial lottery data from API
        console.log('\n🎲 Fetching latest lottery result from API...');
        const apiUrl = process.env.LOTTERY_API_URL || 'https://api-xsmb-today.onrender.com/api/v1';

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const apiData = await response.json();
        console.log(`✅ Received lottery result for date: ${apiData.time}`);

        // Transform date from "7-1-2026" to "2026-01-07"
        const [day, month, year] = apiData.time.split('-');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Use the database
        await connection.query(`USE ${dbName}`);

        // Check if result already exists
        const [existing] = await connection.query(
            'SELECT id FROM xsmb_results WHERE draw_date = ?',
            [formattedDate]
        );

        if (existing.length > 0) {
            console.log(`ℹ️  Result for ${formattedDate} already exists, updating...`);
            await connection.query(
                `UPDATE xsmb_results SET 
                    special_prize = ?, prize_1 = ?, prize_2 = ?, prize_3 = ?,
                    prize_4 = ?, prize_5 = ?, prize_6 = ?, prize_7 = ?
                WHERE draw_date = ?`,
                [
                    apiData.results.ĐB[0],
                    apiData.results.G1[0],
                    JSON.stringify(apiData.results.G2),
                    JSON.stringify(apiData.results.G3),
                    JSON.stringify(apiData.results.G4),
                    JSON.stringify(apiData.results.G5),
                    JSON.stringify(apiData.results.G6),
                    JSON.stringify(apiData.results.G7),
                    formattedDate
                ]
            );
            console.log('✅ Updated existing lottery result');
        } else {
            console.log(`ℹ️  Inserting new result for ${formattedDate}...`);
            await connection.query(
                `INSERT INTO xsmb_results 
                (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    formattedDate,
                    apiData.results.ĐB[0],
                    apiData.results.G1[0],
                    JSON.stringify(apiData.results.G2),
                    JSON.stringify(apiData.results.G3),
                    JSON.stringify(apiData.results.G4),
                    JSON.stringify(apiData.results.G5),
                    JSON.stringify(apiData.results.G6),
                    JSON.stringify(apiData.results.G7)
                ]
            );
            console.log('✅ Inserted new lottery result');
        }

        // Display the inserted data
        const [results] = await connection.query(
            'SELECT * FROM xsmb_results WHERE draw_date = ?',
            [formattedDate]
        );

        console.log('\n📊 Lottery Result in Database:');
        console.log('Date:', formattedDate);
        console.log('Special Prize (ĐB):', results[0].special_prize);
        console.log('Prize 1 (G1):', results[0].prize_1);
        console.log('Prize 2 (G2):', JSON.parse(results[0].prize_2));
        console.log('Prize 3 (G3):', JSON.parse(results[0].prize_3));

        console.log('\n✨ Database setup completed successfully!');
        console.log('🚀 You can now run: npm run dev');

    } catch (error) {
        console.error('\n❌ Error during database setup:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️  MySQL server is not running or not accessible.');
            console.error('Please make sure MySQL is installed and running.');
            console.error('You can check with: Get-Service | Where-Object {$_.Name -like "*mysql*"}');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n⚠️  Access denied. Please check your database credentials in .env.local');
        }

        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed.');
        }
    }
}

// Run setup
setupDatabase();
