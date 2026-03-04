export async function getPerplexityCompletion(prompt: string, model: string = 'sonar-pro') {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("Missing PERPLEXITY_API_KEY in environment variables.");
    }

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là chuyên gia phân tích dữ liệu xổ số miền Bắc (XSMB) khách quan. Bạn luôn trả về kết quả dưới định dạng JSON hợp lệ, không có thêm bất kỳ đoạn văn bản nào khác.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Perplexity API Error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    let content = data.choices[0].message.content;

    // Clean up markdown formatting if any
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    return content;
}
