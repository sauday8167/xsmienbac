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
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    static async generateImage(prompt: string): Promise<string | null> {
        let attempts = 0;
        while (attempts < 3) {
            const apiKey = await KeyManager.getActiveKey('gemini');
            if (!apiKey) return null;
            
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: prompt }],
                        parameters: { sampleCount: 1, aspectRatio: "16:9" }
                    })
                });

                if (!response.ok) throw new Error(await response.text());
                const data = await response.json();
                const base64Image = data?.predictions?.[0]?.bytesBase64Encoded;
                if (!base64Image) throw new Error('No image returned');

                const crypto = await import('crypto');
                const fs = await import('fs/promises');
                const path = await import('path');

                const fileName = `img_${crypto.randomBytes(4).toString('hex')}_${Date.now()}.png`;
                const savePath = path.join(process.cwd(), 'public', 'images', 'posts', fileName);
                
                await fs.writeFile(savePath, base64Image, 'base64');
                return `/images/posts/${fileName}`;

            } catch (error: any) {
                console.error(`Gemini Imagen Error (Attempt ${attempts + 1}):`, error.message);
                if (error.message?.includes('429')) await KeyManager.reportError(apiKey, 'rate_limit');
                else if (error.message?.includes('403')) await KeyManager.reportError(apiKey, 'quota');
                else await KeyManager.reportError(apiKey, 'other');
                attempts++;
            }
        }
        return null;
    }
}
