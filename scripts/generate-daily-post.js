const path = require('path');
const tsConfig = require('../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

// Manually register paths
tsConfigPaths.register({
    baseUrl: path.join(__dirname, '..'),
    paths: tsConfig.compilerOptions.paths
});

// ts-node registration is handled by the CLI execution


async function run() {
    try {
        // Use tomorrow's date by default, or specific date from args
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const targetDate = process.argv[2] || tomorrow.toISOString().split('T')[0];

        console.log(`Generating article for: ${targetDate}`);
        await AutoArticleGenerator.generateDailyPost(targetDate);

    } catch (error) {
        console.error('Failed to generate article:', error);
    }
}

run();
