
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('xsmb.sqlite');

db.all("PRAGMA table_info(api_keys)", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(rows);
    }
});
