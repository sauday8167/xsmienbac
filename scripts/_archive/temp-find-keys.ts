
import { KeyManager } from './src/lib/ai/key-manager.ts';

async function main() {
    console.log('--- Đang truy vấn API Key ---');
    try {
        const geminiKey = await KeyManager.getActiveKey('gemini');
        const claudeKey = await KeyManager.getActiveKey('claude');
        console.log('GEMINI_KEY:', geminiKey);
        console.log('CLAUDE_KEY:', claudeKey);
    } catch (e) {
        console.error('Lỗi truy vấn DB:', e);
    }
}

main().catch(console.error);
