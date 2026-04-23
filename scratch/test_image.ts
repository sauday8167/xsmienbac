
import { ImageGenerator } from '../src/lib/services/image-generator';

async function test() {
    try {
        console.log('Testing ImageGenerator...');
        const path = await ImageGenerator.generateAndSaveImage('A lucky golden cat for lottery website, 4k, professional', 'test-lucky-cat');
        console.log('Image saved to:', path);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

test();
