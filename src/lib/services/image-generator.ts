
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export class ImageGenerator {
    /**
     * Generates an image using Pollinations.ai and saves it locally.
     * @param prompt The descriptive prompt for the image (English works best)
     * @param filenameBase Base name for the file (e.g., slug)
     * @returns The local path to the saved image, or null if failed.
     */
    static async generateAndSaveImage(prompt: string, filenameBase: string): Promise<string | null> {
        try {
            console.log(`[ImageGenerator] Generating image for prompt: "${prompt.substring(0, 50)}..."`);
            
            // Clean prompt for URL
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1200&height=630&seed=${Math.floor(Math.random() * 1000)}&model=flux`;

            // Fetch the image
            const response = await fetch(imageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`[ImageGenerator] Failed to fetch image: ${response.status}`);
                return null;
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            // Ensure directory exists
            const uploadDir = join(process.cwd(), 'public/uploads');
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            // Save file
            const filename = `${filenameBase}-${Date.now()}.jpg`;
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            console.log(`[ImageGenerator] Image saved to ${filename}`);
            return `/uploads/${filename}`;

        } catch (error) {
            console.error('[ImageGenerator] Error generating/saving image:', error);
            return null;
        }
    }
}
