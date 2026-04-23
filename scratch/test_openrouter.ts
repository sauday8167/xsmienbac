
import { OpenRouterClient } from '../src/lib/ai/openrouter-client';

async function test() {
    try {
        console.log('Testing OpenRouterClient...');
        const response = await OpenRouterClient.generateContent('Hãy viết một câu ngắn chào mừng người dùng đến với website xổ số miền Bắc.');
        console.log('Response:', response);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

test();
