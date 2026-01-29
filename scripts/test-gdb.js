const { analyzeAntigravityGdb } = require('./src/lib/gdb-analysis');

async function test() {
    try {
        console.log('Testing GĐB Analysis...');
        const data = await analyzeAntigravityGdb();
        console.log('Success:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

test();
