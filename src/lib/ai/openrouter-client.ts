
import { KeyManager } from './key-manager';

export class OpenRouterClient {
    private static FREE_MODELS = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'google/gemma-3-27b-it:free',
        'google/gemma-3-12b-it:free',
        'google/gemma-3-4b-it:free',
        'qwen/qwen3-next-80b-a3b-instruct:free',
        'openai/gpt-oss-120b:free',
        'z-ai/glm-4.5-air:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'minimax/minimax-m2.5:free',
        'liquid/lfm-2.5-1.2b-instruct:free',
        'qwen/qwen3-coder:free',
        'inclusionai/ling-2.6-1t:free',
        'tencent/hy3-preview:free',
        'inclusionai/ling-2.6-flash:free',
        'google/gemma-3n-e2b-it:free',
        'google/gemma-3n-e4b-it:free',
        'x-ai/grok-4' // Paid fallback
    ];

    static async generateContent(prompt: string, temperature: number = 0.8): Promise<string | null> {
        const apiKey = await KeyManager.getActiveKey('openrouter');
        if (!apiKey) {
            throw new Error('No active OpenRouter API keys available');
        }

        for (const model of this.FREE_MODELS) {
            try {
                console.log(`[OpenRouter] Attempting with model: ${model}...`);
                
                // Add a small delay between models to avoid rapid-fire rate limits
                await new Promise(r => setTimeout(r, 1000));

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://xosomienbac24h.com',
                        'X-Title': 'XSMB 24h'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { 
                                role: 'user', 
                                content: `SYSTEM: You are an expert Vietnamese lottery analyst focusing on high-precision statistical patterns. Always respond in Vietnamese. If asked for JSON, return ONLY valid JSON.\n\nUSER: ${prompt}`
                            }
                        ],
                        temperature: temperature,
                        max_tokens: 4000
                    })
                });

                if (response.status === 402 || response.status === 401) {
                    console.warn(`[OpenRouter] Model ${model} requires payment or key is invalid. Skipping...`);
                    continue;
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    console.warn(`[OpenRouter] Model ${model} failed with status ${response.status}:`, error);
                    continue;
                }

                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    console.log(`[OpenRouter] Success with model: ${model}`);
                    return data.choices[0].message.content;
                }


                console.warn(`[OpenRouter] Model ${model} returned empty content. Skipping...`);
            } catch (error: any) {
                console.error(`[OpenRouter] Error with model ${model}:`, error.message);
            }
        }

        console.warn('[OpenRouter] All models failed. Falling back to Gemini...');
        try {
            const { GeminiClient } = await import('./gemini-client');
            const fallbackResult = await GeminiClient.generateContent(prompt);
            if (fallbackResult) {
                console.log('[OpenRouter] Gemini fallback success.');
                return fallbackResult;
            }
        } catch (geminiError: any) {
            console.error('[OpenRouter] Gemini fallback failed:', geminiError.message);
        }

        throw new Error('All OpenRouter free models failed or were unavailable.');
    }
}
