import fs from 'fs';
import path from 'path';
import { AutoArticleGenerator } from '../src/lib/services/article-generator';

// Load env
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=:#]+)=(.*)$/);
                if (match) {
                    process.env[match[1].trim()] = match[2].trim();
                }
            });
        }
    } catch (e) {
        console.warn('Failed to load .env.local', e);
    }
}
loadEnv();

async function run() {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const targetDate = process.argv[2] || tomorrow.toISOString().split('T')[0];

        console.log(`Generating article for: ${targetDate}`);
        await AutoArticleGenerator.generateDailyPost(targetDate);

    } catch (error) {
        console.error('Failed to generate article:', error);
    }
}

run();
