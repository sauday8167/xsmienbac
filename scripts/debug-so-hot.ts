
import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

    console.log('--- Debug So Hot ---');
    console.log('YOUTUBE_API_KEY:', YOUTUBE_API_KEY ? 'Present' : 'Missing');
    console.log('PERPLEXITY_API_KEY:', PERPLEXITY_API_KEY ? 'Present' : 'Missing');

    const dateStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const searchQuery = `soi cầu xsmb ${dateStr}`;
    const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${encodeURIComponent(searchQuery)}&type=video&order=date&maxResults=5&key=${YOUTUBE_API_KEY}`;

    console.log('\n1. Testing YouTube Search...');
    try {
        const ytRes = await fetch(ytSearchUrl);
        const ytData: any = await ytRes.json();
        if (ytData.error) {
            console.error('YouTube Search Error:', ytData.error);
        } else {
            console.log(`Found ${ytData.items?.length || 0} videos.`);
            if (ytData.items && ytData.items.length > 0) {
                const firstVideo = ytData.items[0];
                console.log(`First video: ${firstVideo.snippet.title} (ID: ${firstVideo.id.videoId})`);

                console.log('\n2. Testing Transcript Fetching for first video...');
                try {
                    const transcript = await YoutubeTranscript.fetchTranscript(firstVideo.id.videoId, { lang: 'vi' });
                    console.log(`Successfully fetched transcript (${transcript.length} blocks).`);
                    console.log('Preview:', transcript.slice(0, 3).map(t => t.text).join(' '));
                } catch (e: any) {
                    console.error('Transcript Fetch Error:', e.message);
                }
            }
        }
    } catch (e: any) {
        console.error('Fetch Error:', e.message);
    }

    console.log('\n3. Testing Perplexity AI (minimal prompt)...');
    try {
        const res = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [{ role: 'user', content: 'Say hello' }]
            })
        });
        if (res.ok) {
            const data: any = await res.json();
            console.log('Perplexity Response:', data.choices[0].message.content);
        } else {
            console.error('Perplexity Error:', res.status, await res.text());
        }
    } catch (e: any) {
        console.error('Perplexity Fetch Error:', e.message);
    }
}

test().catch(console.error);
