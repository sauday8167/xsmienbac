import { query } from './src/lib/db';

async function fix() {
    try {
        console.log('Updating model_used labels in ai_predictions...');
        
        await query(`
            UPDATE ai_predictions 
            SET model_used = 'claude-3-haiku-hoi-dong'
            WHERE model_used = 'claude-3-5-sonnet'
        `);

        await query(`
            UPDATE ai_predictions 
            SET model_used = 'claude-3-haiku-3-so'
            WHERE model_used = 'claude-3-5-sonnet-3-so'
        `);

        console.log('Update successful!');
    } catch (e) {
        console.error(e);
    }
}

fix();
