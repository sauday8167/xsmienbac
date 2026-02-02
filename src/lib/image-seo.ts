/**
 * Generates SEO-optimized Alt text for images.
 * @param context The title or context of the image (e.g., Post Title).
 * @param index Optional index to vary the pattern for multiple images.
 * @param date Optional date.
 * @returns SEO-friendly alt text string.
 */
export function generateSmartAltText(context: string, index: number = 0, date?: string | Date): string {
    const dateStr = date
        ? new Date(date).toLocaleDateString('vi-VN')
        : new Date().toLocaleDateString('vi-VN');

    // Clean context
    const cleanContext = context.replace(/["']/g, '');

    // Patterns
    const patterns = [
        `${cleanContext} chính xác nhất ngày ${dateStr}`,
        `Chi tiết ${cleanContext} cập nhật ${dateStr}`,
        `Hình ảnh ${cleanContext} - XSMB 24h`,
        `Thống kê ${cleanContext} mới nhất`,
        `Dự đoán ${cleanContext} hôm nay`,
        `Bảng kết quả ${cleanContext}`
    ];

    // Pick a deterministic pattern based on (context length + index)
    const pIndex = (cleanContext.length + index) % patterns.length;
    return patterns[pIndex];
}

/**
 * Process HTML content to auto-inject SEO friendly Alt tags to images.
 */
export function processContentImages(html: string, postTitle: string): string {
    let imgIndex = 0;
    return html.replace(/<img([^>]*)>/g, (match, attributes) => {
        imgIndex++;
        const altText = generateSmartAltText(postTitle, imgIndex);

        // Remove existing alt attribute if present to avoid duplicates
        const cleanAttrs = attributes.replace(/\s*alt=['"][^'"]*['"]/, '');

        // Reconstruct tag with new alt
        return `<img alt="${altText}" ${cleanAttrs}>`;
    });
}
