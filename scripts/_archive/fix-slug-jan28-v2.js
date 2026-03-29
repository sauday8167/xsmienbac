
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

const targetDate = '2026-01-28';
const oldSlugLike = `du-doan-xsmb-${targetDate}-%`;
const newSlug = `du-doan-xsmb-${targetDate}`;

function closeDb() {
    db.close((err) => {
        if (err) console.error('Error closing DB:', err);
        else console.log('Database connection closed.');
    });
}

db.serialize(() => {
    // 1. Check if the post exists with old slug
    db.all(`SELECT id, slug FROM posts WHERE slug LIKE ? AND slug != ?`, [oldSlugLike, newSlug], (err, rows) => {
        if (err) {
            console.error('Error finding post:', err);
            closeDb();
            return;
        }

        if (rows.length === 0) {
            console.log('No post found with old slug format (or already updated).');
            // Check if it's already updated
            db.get(`SELECT id, slug FROM posts WHERE slug = ?`, [newSlug], (err, row) => {
                if (row) console.log(`Post already has correct slug: ${row.slug}`);
                closeDb();
            });
            return;
        }

        console.log(`Found ${rows.length} post(s) to fix:`);
        rows.forEach(row => console.log(`- ID: ${row.id}, Slug: ${row.slug}`));

        const postToFix = rows[0];

        // 2. Update to new slug
        db.run(`UPDATE posts SET slug = ? WHERE id = ?`, [newSlug, postToFix.id], function (err) {
            if (err) {
                console.error('Error updating slug:', err);
            } else {
                console.log(`Successfully updated post ${postToFix.id} to new slug: ${newSlug}`);
                console.log(`Rows changed: ${this.changes}`);
            }
            closeDb();
        });
    });
});
