
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://ixoso.com/so-mo.html'; // ?page={i}
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/dream-data.json');
const TOTAL_PAGES = 24;

interface DreamEntry {
    id: number;
    keywords: string[];
    numbers: string[];
    description: string;
    category: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapePage(page: number): Promise<DreamEntry[]> {
    try {
        const url = `${BASE_URL}?page=${page}`;
        console.log(`Fetching page ${page}: ${url}...`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const entries: DreamEntry[] = [];

        // Select rows. Usually the first tr is header.
        const rows = $('table tr');

        rows.each((i, row) => {
            // Skip header if it contains specific text or is just header
            const cols = $(row).find('td');
            if (cols.length < 2) return;

            const description = $(cols[0]).text().trim();
            const numbersRaw = $(cols[1]).text().trim();

            if (!description || !numbersRaw || description.toLowerCase().includes('mơ thấy')) return; // Check valid row

            // Normalize numbers: split by comma, space, clean
            const numbers = numbersRaw.split(/[,;\s]+/)
                .map(n => n.trim())
                .filter(n => /^\d+$/.test(n)); // Keep only digits

            // Skip if no valid numbers
            if (numbers.length === 0) return;

            // Generate keywords from description
            // Simple keyword extraction: lower case, remove accents?
            // User request implies "content from link", so we use description as is.
            // But our schema needs keywords array.
            const keywords = [description.toLowerCase()];

            entries.push({
                id: 0, // Assigned later
                keywords,
                numbers,
                description: `Mơ thấy ${description}`, // Add prefix for consistency
                category: 'Tổng hợp' // Default
            });
        });

        console.log(`Page ${page}: extracted ${entries.length} entries.`);
        return entries;

    } catch (error) {
        console.error(`Error scraping page ${page}:`, error);
        return [];
    }
}

async function main() {
    let allEntries: DreamEntry[] = [];

    for (let i = 1; i <= TOTAL_PAGES; i++) {
        const pageEntries = await scrapePage(i);
        allEntries = allEntries.concat(pageEntries);
        // Be nice to the server
        await sleep(500);
    }

    // Post-process: Assign IDs and Categorize (simple heuristic)
    allEntries = allEntries.map((entry, index) => ({
        ...entry,
        id: index + 1,
        // Optional: Simple categorization based on keywords if desired
        category: categorize(entry.keywords[0])
    }));

    console.log(`Total extracted: ${allEntries.length} entries.`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allEntries, null, 4), 'utf-8');
    console.log(`Saved to ${OUTPUT_FILE}`);
}

function categorize(text: string): string {
    const t = text.toLowerCase();
    if (t.includes('người') || t.includes('bố') || t.includes('mẹ') || t.includes('anh')) return 'Con người';
    if (t.includes('cá') || t.includes('chó') || t.includes('mèo') || t.includes('rắn')) return 'Động vật';
    if (t.includes('ăn') || t.includes('uống') || t.includes('chạy') || t.includes('khóc')) return 'Hoạt động';
    if (t.includes('tiền') || t.includes('vàng') || t.includes('xe') || t.includes('nhà')) return 'Đồ vật';
    return 'Tổng hợp';
}

main();
