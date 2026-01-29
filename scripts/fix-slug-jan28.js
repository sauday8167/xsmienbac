
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

const targetDate = '2026-01-28';
const oldSlugLike = `du-doan-xsmb-${targetDate}-%`;
const newSlug = `du-doan-xsmb-${targetDate}`;

db.serialize(() => {
    // 1. Check if the post exists with old slug
    db.all(`SELECT id, slug FROM posts WHERE slug LIKE ? AND slug != ?`, [oldSlugLike, newSlug], (err, rows) => {
        if (err) {
            console.error('Error finding post:', err);
            return;
        }

        if (rows.length === 0) {
            console.log('No post found with old slug format.');
            return;
        }

        console.log(`Found ${rows.length} post(s) to fix:`);
        rows.forEach(row => console.log(`- ID: ${row.id}, Slug: ${row.slug}`));

        // 2. Update to new slug
        // Note: verify if new slug already exists to avoid unique constraint error
        db.get(`SELECT id FROM posts WHERE slug = ?`, [newSlug], (err, existing) => {
            if (existing) {
                console.log(`Post with new slug ${newSlug} already exists (ID: ${existing.id}). Cannot rename old post without conflict.`);
                // Option: Delete the old one if it's a duplicate, or just warn.
                // For safety, we will just warn here.
                console.log('Skipping rename to avoid conflict.');
            } else {
                const postToFix = rows[0]; // Take the first one found
                db.run(`UPDATE posts SET slug = ? WHERE id = ?`, [newSlug, postToFix.id], (err) => {
                    if (err) console.error('Error updating slug:', err);
                    else console.log(`Successfully updated post ${postToFix.id} to new slug: ${newSlug}`);
                });
            }
        });
    });
});

db.close();
