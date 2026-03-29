const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function checkSchema() {
    const db = await open({
        filename: 'database/xsmb.sqlite',
        driver: sqlite3.Database
    });
    
    const tableInfo = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='ai_predictions'");
    console.log("TABLE SCHEMA:", tableInfo.sql);
    
    const sampleData = await db.all("SELECT id, draw_date, model_used FROM ai_predictions ORDER BY draw_date DESC LIMIT 10");
    console.log("SAMPLE DATA:", sampleData);
    
    await db.close();
}

checkSchema().catch(console.error);
