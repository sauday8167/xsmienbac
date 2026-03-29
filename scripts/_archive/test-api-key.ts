import { GoogleGenerativeAI } from '@google/generative-ai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function testKey() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        console.log('Fetching active key from DB...');
        const keyRecord = await db.get("SELECT * FROM api_keys WHERE status = 'active' LIMIT 1");

        if (!keyRecord) {
            console.error('No active keys found in DB!');
            return;
        }

        const apiKey = keyRecord.key;
        console.log(`Testing key: ${apiKey.substring(0, 8)}...`);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        console.log('Sending test prompt...');
        const result = await model.generateContent('Hello, are you working? Respond with "YES" only.');
        const response = await result.response;
        const text = response.text();

        console.log('Success! Response:', text);

    } catch (error: any) {
        console.error('API Error Details:');
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data || error.response, null, 2));
        } else {
            console.error('Full Error:', error);
        }
    } finally {
        await db.close();
    }
}

testKey();
