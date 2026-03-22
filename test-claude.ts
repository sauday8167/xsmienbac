import { ClaudeClient } from './src/lib/ai/claude-client';

async function test() {
    try {
        console.log('Testing Claude 3.5 Sonnet...');
        const res = await ClaudeClient.generateContent('Hi', 'claude-3-5-sonnet-20240620');
        console.log('Sonnet Result:', res);
    } catch (e: any) {
        console.error('Sonnet Failed:', e.message);
        try {
            console.log('Testing Claude 3 Haiku...');
            const res2 = await ClaudeClient.generateContent('Hi', 'claude-3-haiku-20240307');
            console.log('Haiku Result:', res2);
        } catch (e2: any) {
            console.error('Haiku Failed:', e2.message);
        }
    }
}

test();
