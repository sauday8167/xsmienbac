// Delete old AI prediction and trigger regeneration
const { query } = require('./src/lib/db');
const fetch = require('node-fetch');

async function regenerateAIPrediction() {
    console.log('🔄 Regenerating AI Prediction...\n');

    // Step 1: Delete old prediction for 2026-01-19
    console.log('1️⃣ Deleting old prediction...');
    const result = await query(
        'DELETE FROM ai_predictions WHERE draw_date = ?',
        ['2026-01-19']
    );
    console.log(`   ✅ Deleted ${result.changes || 1} old prediction(s)\n`);

    // Step 2: Trigger regeneration via API
    console.log('2️⃣ Triggering AI analysis...');
    console.log('   ⏳ This may take 10-20 seconds...\n');

    try {
        const response = await fetch('http://localhost:3000/api/ai-prediction/generate', {
            method: 'POST'
        });

        const data = await response.json();
        console.log('   📡 API Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ AI Prediction regenerated successfully!');
            console.log('🌐 Check http://localhost:3000/du-doan-ai now\n');
        } else {
            console.log('\n❌ API returned error:', data.error);
        }
    } catch (error) {
        console.error('\n❌ Error calling API:', error.message);
    }
}

regenerateAIPrediction();
