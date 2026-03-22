import { ClaudeClient } from './src/lib/ai/claude-client';

async function test() {
    try {
        console.log('Testing Sonnet 20241022...');
        const res = await ClaudeClient.generateContent('Hi', 'claude-3-5-sonnet-20241022');
        console.log('20241022 Success:', res);
    } catch (e: any) {
        console.error('20241022 Failed:', e.message);
        try {
            console.log('Testing Sonnet 20240620 again...');
            const res2 = await ClaudeClient.generateContent('Hi', 'claude-3-5-sonnet-20240620');
            console.log('20240620 Success:', res2);
        } catch (e2: any) {
             console.error('20240620 Failed:', e2.message);
        }
    }
}

test();
