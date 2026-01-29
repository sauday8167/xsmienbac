import { GoogleGenerativeAI } from '@google/generative-ai';
import { KeyManager } from './key-manager';

export class GeminiClient {
    static async generateContent(prompt: string): Promise<string | null> {
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            const apiKey = await KeyManager.getActiveKey('gemini');
            if (!apiKey) {
                throw new Error('No active API keys available');
            }

            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();

            } catch (error: any) {
                console.error(`Gemini Error (Attempt ${attempts + 1}):`, error.message);

                // Identify error type
                if (error.message?.includes('429') || error.status === 429) {
                    await KeyManager.reportError(apiKey, 'rate_limit');
                } else if (error.message?.includes('403') || error.status === 403) {
                    await KeyManager.reportError(apiKey, 'quota');
                } else {
                    await KeyManager.reportError(apiKey, 'other');
                }

                attempts++;
            }
        }

        throw new Error('Failed to generate content after multiple attempts');
    }
}
