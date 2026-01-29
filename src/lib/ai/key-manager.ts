import { query, queryOne } from '../db';

export type APIKeyStatus = 'active' | 'rate_limited' | 'quota_exceeded' | 'disabled';

export interface APIKey {
    id: number;
    key: string;
    provider: string; // 'gemini' | 'claude'
    status: APIKeyStatus;
    usage_count: number;
}

export class KeyManager {
    /**
     * Get the next available active key for a specific provider.
     * Falls back to environment variable if no keys in database.
     */
    static async getActiveKey(provider: string = 'gemini'): Promise<string | null> {
        // Simple strategy: Get first active key from database for the provider
        const keyRecord = await queryOne<APIKey>(
            `SELECT * FROM api_keys WHERE status = 'active' AND (provider = ? OR provider IS NULL) ORDER BY last_used ASC LIMIT 1`,
            [provider]
        );

        if (!keyRecord) {
            console.warn(`No active API keys for ${provider} in database`);

            // Fallback to environment variable for Gemini only (legacy support)
            if (provider === 'gemini') {
                const envKey = process.env.GOOGLE_API_KEY;
                if (envKey && envKey !== 'your_gemini_api_key_here') {
                    return envKey;
                }
            } else if (provider === 'claude') {
                const envKey = process.env.ANTHROPIC_API_KEY;
                if (envKey) return envKey;
            }

            return null;
        }

        // Update usage stats immediately to rotate slightly
        await query(
            `UPDATE api_keys SET last_used = CURRENT_TIMESTAMP, usage_count = usage_count + 1 WHERE id = ?`,
            [keyRecord.id]
        );

        return keyRecord.key;
    }

    /**
     * Report an error for a key.
     * If 429 (Rate Limit) -> Mark as rate_limited
     * If 403 (Quota) -> Mark as quota_exceeded
     */
    static async reportError(key: string, errorType: 'rate_limit' | 'quota' | 'other') {
        let newStatus: APIKeyStatus = 'active';

        if (errorType === 'rate_limit') newStatus = 'rate_limited';
        if (errorType === 'quota') newStatus = 'quota_exceeded';

        if (newStatus !== 'active') {
            await query(
                `UPDATE api_keys SET status = ?, error_count = error_count + 1 WHERE key = ?`,
                [newStatus, key]
            );
            console.log(`Key ${key.substring(0, 8)}... marked as ${newStatus}`);
        } else {
            await query(
                `UPDATE api_keys SET error_count = error_count + 1 WHERE key = ?`,
                [key]
            );
        }
    }

    /**
     * Reset rate-limited keys after some time (e.g., hourly).
     * This should be called by cron.
     */
    static async resetRateLimitedKeys() {
        await query(
            `UPDATE api_keys SET status = 'active' WHERE status = 'rate_limited'`
        );
    }
}
