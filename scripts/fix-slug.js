const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const path = require('path');

(async () => {
    try {
        const db = await sqlite.open({ filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'), driver: sqlite3.Database });
        
        // Find the bad slug
        const rows = await db.all("SELECT id, slug FROM posts WHERE slug LIKE '%lội-nước%' OR slug LIKE '%loi-nuoc%'");
        console.log('Found:', rows);
        
        if (rows.length > 0) {
            await db.run("UPDATE posts SET slug = 'giai-ma-giac-mo-thay-bi-loi-nuoc-2026-04-05' WHERE id = ?", [rows[0].id]);
            console.log('Update successful');
        }
        
        await db.close();
    } catch (e) {
        console.error(e);
    }
})();
