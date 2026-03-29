
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Define the keyword to URL mapping
const KEYWORD_MAP: { [key: string]: string } = {
    'xổ số miền bắc': '/',
    'xsmb': '/',
    'soi cầu bạch thủ': '/soi-cau-bach-thu',
    'soi cầu': '/soi-cau-bach-thu',
    'quay thử': '/quay-thu',
    'thống kê': '/thong-ke',
    'loto': '/thong-ke',
    'lô tô': '/thong-ke',
    'bạch thủ lô': '/soi-cau-bach-thu',
    'giải đặc biệt': '/thong-ke/dac-biet',
    'lô gan': '/thong-ke/loto-gan',
};

async function openDb() {
    return await (new sqlite3.Database(path.join(process.cwd(), 'database', 'xsmb.sqlite')));
}

// Function to inject links into content
// Policy: Only link the FIRST occurrence of each keyword to avoid spamming.
// Constraint: Do not link if already inside an <a> tag.
function injectLinks(content: string): string {
    let newContent = content;

    // Sort keywords by length descending to match longer phrases first (e.g. "soi cầu bạch thủ" before "soi cầu")
    const keywords = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);

    for (const keyword of keywords) {
        const url = KEYWORD_MAP[keyword];

        // Regex Lookbehind/Lookahead is tricky in JS for "not inside <a>" without DOM parsing.
        // A simple robust approach is to iterate and check context, or use a placeholder approach.
        // Given complexity, we will use a simplified regex that tries to match the keyword
        // provided it's NOT followed immediately by </a> or inside an href.
        // BUT, properly parsing HTML to avoid existing links is safer.

        // Simpler approach: 
        // 1. Replace all existing <a ...>...</a> tags with placeholders.
        // 2. Perform linking on the text.
        // 3. Restore placeholders.

        const placeholders: string[] = [];
        // Match existing <a> tags (non-greedy)
        newContent = newContent.replace(/<a\b[^>]*>(.*?)<\/a>/gi, (match) => {
            placeholders.push(match);
            return `###LINK_PLACEHOLDER_${placeholders.length - 1}###`;
        });

        // Now replace the FIRST occurrence of the keyword case-insensitive
        // We use a regex with word boundary check if possible, or just exact match for Vietnamese phrases.
        // Vietnamese word boundaries are tricky (\b works for latin chars). 
        // We often just match the string. 

        const regex = new RegExp(`(${keyword})`, 'i'); // Case insensitive capture

        // However, we only want the FIRST one. valid replacement.
        // String.replace with regex without 'g' flag replaces only the first occurrence.
        if (regex.test(newContent)) {
            newContent = newContent.replace(regex, `<a href="${url}" title="$1" style="color: #d90429; font-weight: 500; text-decoration: underline;">$1</a>`);
        }

        // Restore placeholders
        placeholders.forEach((ph, index) => {
            newContent = newContent.replace(`###LINK_PLACEHOLDER_${index}###`, ph);
        });
    }

    return newContent;
}

async function run() {
    console.log('🔗 Starting Auto Internal Linking...');

    // Connect to DB directly using sqlite3 (simpler for scripts usually, or use the wrapper)
    // Actually the project uses 'sqlite' wrapper often. Let's try to adapt to what we see in other scripts.
    // Inspecting `scripts/manual-update-feb.ts` used `src/lib/db.ts` but dealing with TS paths is annoying in scripts without ts-node setup correctly sometimes.
    // Let's stick to raw sqlite3 logic for this standalone script or use the `sqlite` package which is likely installed.
    // The previous script `manual-update-feb.ts` was TS and ran with `tsx`. So we can use `tsx`.

    // Re-implementing simplified DB connection to avoid import issues
    const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
    // Using 'sqlite' wrapper import style if package.json has it
    // Let's assume 'sqlite' and 'sqlite3' are available.

    const db = await import('sqlite').then(sqlite => sqlite.open({
        filename: dbPath,
        driver: sqlite3.Database
    }));

    // Fetch posts
    // Assuming table name is 'posts'? Let's check schema/previous learning.
    // `database/schema.sql` -> table `posts`. Columns: id, title, content...

    const posts = await db.all('SELECT id, title, content, slug FROM posts');
    console.log(`Found ${posts.length} posts.`);

    let updatedCount = 0;

    for (const post of posts) {
        if (!post.content) continue;

        const originalContent = post.content;
        const linkedContent = injectLinks(originalContent);

        if (originalContent !== linkedContent) {
            console.log(`Updating links for post: ${post.title} (ID: ${post.id})`);
            await db.run('UPDATE posts SET content = ? WHERE id = ?', [linkedContent, post.id]);
            updatedCount++;
        }
    }

    console.log(`✅ Finished. Updated ${updatedCount} posts.`);
    await db.close();
}

run().catch(console.error);
