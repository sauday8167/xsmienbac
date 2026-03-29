import { GoogleGenerativeAI } from '@google/generative-ai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

async function listModels() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const keyRecord = await db.get("SELECT * FROM api_keys WHERE status = 'active' LIMIT 1");
        if (!keyRecord) {
            console.error('No active key found');
            return;
        }

        console.log('Fetching models from Google...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyRecord.key}`);
        const data = await response.json();

        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log('Models saved to models_list.json');

    } catch (error: any) {
        console.error('List Models Error:', error.message);
    } finally {
        await db.close();
    }
}

listModels();
