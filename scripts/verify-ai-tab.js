
const axios = require('axios');

async function verify() {
    try {
        console.log("Testing API...");
        const url = 'http://localhost:3000/api/soi-cau-bach-thu?type=ai-mining&amplitude=3';
        const res = await axios.get(url, { validateStatus: false }); // Accept all codes

        console.log("Status:", res.status);
        if (res.status === 200) {
            const data = res.data.data;
            console.log("AI Patterns found:", (data.aiPatterns || []).length);
            console.log("Debug Info:", res.data._debug);
            console.log("Source:", res.data._source);
            if (data.aiPatterns && data.aiPatterns.length > 0) {
                console.log("Example:", data.aiPatterns[0]);
                console.log("✅ API Logic Verified!");
            } else {
                console.log("❌ No patterns returned (might be db data issue or logic bug).");
            }
        } else {
            console.log("❌ Error response:", res.data);
        }

    } catch (e) { console.error(e); }
}

verify();
