const { analyzeLotoRoi } = require('../src/lib/loto-roi');

async function test() {
    try {
        const data = await analyzeLotoRoi();
        console.log('--- Loto Roi Analysis ---');
        console.log('Date:', data.date);
        console.log('Risks:', JSON.stringify(data.risks, null, 2));
        console.log('Financial Plan Days Count:', data.financialPlan.days.length);
        console.log('History Sample:', data.history[0].date);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
