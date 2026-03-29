const sqlite3 = require('sqlite3'); 
const db = new sqlite3.Database('database/xsmb.sqlite'); 
db.all('SELECT id, draw_date, model_used, predicted_pairs FROM ai_predictions WHERE draw_date = \"2026-03-30\"', [], (err, rows) => { 
    console.log(JSON.stringify(rows, null, 2)); 
});
