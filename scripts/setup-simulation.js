/**
 * Script to create simulation table and generate test data
 */

const { query } = require('../src/lib/db');
const { generateSimulationResult } = require('../src/lib/simulation-generator');
const { saveSimulationResult } = require('../src/lib/simulation-service');

async function setup() {
    console.log('🔧 Setting up simulation feature...\n');

    // 1. Create table
    console.log('1️⃣ Creating simulation_results table...');
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS simulation_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                simulation_date DATE NOT NULL,
                simulation_hour TINYINT NOT NULL,
                simulation_time TIME NOT NULL,
                special_prize VARCHAR(5),
                prize_1 VARCHAR(5),
                prize_2 JSON,
                prize_3 JSON,
                prize_4 JSON,
                prize_5 JSON,
                prize_6 JSON,
                prize_7 JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_simulation (simulation_date, simulation_hour),
                INDEX idx_date (simulation_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Table created successfully\n');
    } catch (error) {
        console.error('❌ Error creating table:', error.message);
        process.exit(1);
    }

    // 2. Generate 3 test simulations
    console.log('2️⃣ Generating 3 test simulations...');
    try {
        for (let hour = 0; hour < 3; hour++) {
            const result = generateSimulationResult(hour);
            await saveSimulationResult(result);
            console.log(`   ✅ Simulation ${hour + 1} saved (hour ${hour})`);
        }
        console.log('\n✅ Test data generated successfully\n');
    } catch (error) {
        console.error('❌ Error generating test data:', error.message);
        process.exit(1);
    }

    console.log('🎉 Setup complete! Visit http://localhost:3000/mo-phong to see results\n');
    process.exit(0);
}

setup();
