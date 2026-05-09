
import { KeyManager } from './key-manager';

export class OpenRouterClient {
    // Paid fallback models — tried in order when Claude is unavailable
    private static PAID_MODELS = [
        'google/gemini-2.5-flash',
        'x-ai/grok-4',
    ];

    static async generateContent(prompt: string, temperature: number = 0.8): Promise<string | null> {
        const apiKey = await KeyManager.getActiveKey('openrouter');
        if (!apiKey) {
            throw new Error('No active OpenRouter API keys available');
        }

        for (const model of this.PAID_MODELS) {
            try {
                console.log(`[OpenRouter] Attempting with model: ${model}...`);

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://xosomienbac24h.com',
                        'X-Title': 'XSMB 24h'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            {
                                role: 'user',
                                content: `SYSTEM: You are an expert Vietnamese lottery analyst. Always respond in Vietnamese. If asked for JSON, return ONLY valid JSON.\n\nUSER: ${prompt}`
                            }
                        ],
                        temperature,
                        max_tokens: 8000
                    })
                });

                if (response.status === 402 || response.status === 401) {
                    console.warn(`[OpenRouter] Model ${model}: payment required or invalid key. Skipping...`);
                    continue;
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    console.warn(`[OpenRouter] Model ${model} failed (${response.status}):`, error);
                    continue;
                }

                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    console.log(`[OpenRouter] Success with model: ${model}`);
                    return data.choices[0].message.content;
                }

                console.warn(`[OpenRouter] Model ${model} returned empty content. Skipping...`);
            } catch (error: any) {
                console.error(`[OpenRouter] Error with model ${model}:`, error.message);
            }
        }

        throw new Error('All OpenRouter paid models failed or were unavailable.');
    }
}
