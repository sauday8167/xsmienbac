export async function GET(request: Request) {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const BASE_URL = `${protocol}://${host}`;

    const content = `User-agent: *
Disallow: /admin/
Disallow: /ket-qua-theo-ngay/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /cgi-bin/
Disallow: /*?* # Block URLs with query parameters to prevent crawl traps

# Specific path indexing rules
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml`;

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
