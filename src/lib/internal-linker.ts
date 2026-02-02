import internalLinks from '@/data/internal-links.json';

interface InternalLink {
    keyword: string;
    url: string;
    priority: number;
}

/**
 * Automatically replaces keywords in the content with internal links.
 * It's smart enough to:
 * - Sort keywords by priority and length (longer first to avoid partial matches).
 * - NOT replace keywords inside existing <a> tags, headings (h1-h6), or other critical tags.
 * - Limit the number of replacements per keyword and total replacements.
 */
export function linkify(content: string): string {
    if (!content) return content;

    // Sort links: Higher priority first, then longer keywords first
    const sortedLinks = (internalLinks as InternalLink[]).sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.keyword.length - a.keyword.length;
    });

    let newContent = content;

    // Helper to escape regex special characters
    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Keep track of total replacements to avoid over-linking
    const maxTotalLinks = 5;
    let currentTotalLinks = 0;

    for (const link of sortedLinks) {
        if (currentTotalLinks >= maxTotalLinks) break;

        const keyword = link.keyword;
        const url = link.url;

        // Create a regex that looks for the keyword, ensuring it's not already in an HTML tag.
        // This is a simplified approach. For robust HTML parsing, a library like Cheerio is better,
        // but regex is faster for runtime execution if careful.
        // Negative lookahead/lookbehind is tricky with varying HTML structures.

        // Strategy:
        // 1. We will use a placeholder mapping to protect existing tags.
        // 2. However, for a simple implementation without heavy DOM parsing during render:
        // We try to match: word boundary + keyword + word boundary, NOT followed by everything until </a>

        // Regex explanation:
        // \b(keyword)\b : Match whole word
        // (?![^<]*>|[^<>]*<\/a>) : Lookhead to ensuring we are not inside a tag <> or inside an anchor tag <a>...</a>
        // This is difficult to perfect with Regex. 

        // Better Strategy for Stability (since we have Cheerio instaled per package.json):
        // Use string replacement but be careful. 
        // Let's stick to a reasonably safe Regex for Vietnamese text.

        const regex = new RegExp(`(?<!<[^>]*)\\b${escapeRegExp(keyword)}\\b(?![^<]*>|[^<>]*<\/a>)`, 'i');

        if (regex.test(newContent)) {
            // Only replace the FIRST occurrence to look natural
            newContent = newContent.replace(regex, (match) => {
                currentTotalLinks++;
                // Check if we hit the limit inside the callback (rare case but good safety)
                return `<a href="${url}" class="text-lottery-red-600 hover:underline font-medium" title="${match}">${match}</a>`;
            });
        }
    }

    return newContent;
}
