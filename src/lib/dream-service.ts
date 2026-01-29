import dreamData from '@/data/dream-data.json';
import { query } from './db';

export interface DreamEntry {
    id: number;
    keywords: string[];
    numbers: string[];
    description: string;
    category: string;
    matchDate?: string; // Date if a number matched recently
}

/**
 * Remove accents and convert to lowercase for better matching
 */
export function normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Check if any of the numbers appeared in recent lottery results
 */
export async function checkDreamMatches(numbers: string[]): Promise<string | null> {
    try {
        if (!numbers || numbers.length === 0) return null;

        // Get last 7 days of results to check for matches
        const recentResults = await query<any[]>(
            `SELECT draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7 
             FROM xsmb_results 
             ORDER BY draw_date DESC LIMIT 7`
        );

        for (const res of recentResults) {
            const allNumbers: string[] = [];
            if (res.special_prize) allNumbers.push(res.special_prize.slice(-2));
            if (res.prize_1) allNumbers.push(res.prize_1.slice(-2));

            // Collect all loto numbers from other prizes
            [res.prize_2, res.prize_3, res.prize_4, res.prize_5, res.prize_6, res.prize_7].forEach(p => {
                try {
                    const parsed = JSON.parse(p);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(n => allNumbers.push(n.slice(-2)));
                    }
                } catch (e) { }
            });

            // Check if any dream number is in this draw
            if (numbers.some(n => allNumbers.includes(n.padStart(2, '0')))) {
                return res.draw_date;
            }
        }
    } catch (error) {
        console.error('Error checking dream matches:', error);
    }
    return null;
}

/**
 * Basic fuzzy search implementation
 * Scores entries based on how many keywords match the query
 */
export function searchDreams(query: string): DreamEntry[] {
    const normalizedQuery = normalizeText(query);
    const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

    if (queryTokens.length === 0) return [];

    const scoredResults = dreamData.map(entry => {
        let score = 0;

        // Check fuzzy match on keywords
        entry.keywords.forEach(keyword => {
            const normalizedKeyword = normalizeText(keyword);

            // Exact match bonus
            if (normalizedQuery.includes(normalizedKeyword)) {
                score += 10;
            }
            // Partial match
            else if (keyword.split(" ").some(kwToken => normalizedQuery.includes(normalizeText(kwToken)))) {
                score += 2;
            }
        });

        // Check description match
        if (normalizeText(entry.description).includes(normalizedQuery)) {
            score += 5;
        }

        return { ...entry, score };
    });

    // Filter results with score > 0 and sort by score
    return scoredResults
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ score, ...entry }) => entry);
}

/**
 * Get popular/random dreams for initial display
 */
export function getTrendingDreams(limit: number = 6): DreamEntry[] {
    // For now, just return a random subset or specific IDs
    // In a real app, this would come from analytics
    return dreamData.slice(0, limit);
}
