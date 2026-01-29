
import { ContextProvider } from '@/lib/ai/context-provider';

async function main() {
    try {
        console.log('Testing Context Provider with History...');

        // Simulating a date - use today's date
        // Note: For history to show up, there must be records in ai_predictions table with date < targetDate
        const vnDateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());

        console.log(`Target Date: ${vnDateStr}`);

        const context = await ContextProvider.getDailyContext(vnDateStr);
        const promptText = ContextProvider.formatContextForPrompt(context);

        console.log('\n--- GENERATED PROMPT SNIPPET (START) ---');
        console.log(promptText.substring(0, 1000)); // Print first 1000 chars to see the history part
        console.log('--- GENERATED PROMPT SNIPPET (END) ---\n');

        if (promptText.includes('PREVIOUS AI PERFORMANCE')) {
            console.log('✅ SUCCESS: "PREVIOUS AI PERFORMANCE" section found in prompt.');
        } else {
            console.error('❌ FAILURE: "PREVIOUS AI PERFORMANCE" section NOT found.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
