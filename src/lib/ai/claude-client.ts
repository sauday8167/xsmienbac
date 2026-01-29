
import { KeyManager } from './key-manager';

export class ClaudeClient {
    static async generateContent(prompt: string, model: string = 'claude-3-5-sonnet-20240620'): Promise<string | null> {
        // 1. Get API Key
        const apiKey = await KeyManager.getActiveKey('claude');
        if (!apiKey) {
            throw new Error('No active Claude API keys available');
        }

        try {
            // 2. Call Anthropic API
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 4000,
                    system: "You are an expert Vietnamese lottery analyst.",
                    messages: [
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const status = response.status;

                // Handle Rate Limits
                if (status === 429) {
                    await KeyManager.reportError(apiKey, 'rate_limit');
                } else if (status === 403 || status === 401) {
                    await KeyManager.reportError(apiKey, 'quota');
                } else {
                    await KeyManager.reportError(apiKey, 'other');
                }

                throw new Error(`Anthropic API Error: ${status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.content[0].text;

        } catch (error: any) {
            console.error('ClaudeClient Error:', error.message);
            throw error;
        }
    }
}
