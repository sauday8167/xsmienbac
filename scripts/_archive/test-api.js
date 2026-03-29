// Simple script to test API and fetch lottery data without database
const apiUrl = 'https://api-xsmb-today.onrender.com/api/v1';

console.log('🎲 Testing XSMB API...');
console.log(`API URL: ${apiUrl}\n`);

fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ API Response received successfully!\n');
        console.log('📊 Lottery Result:');
        console.log('Date:', data.time);
        console.log('Total Numbers:', data.countNumbers);
        console.log('\nPrizes:');
        console.log('Giải Đặc Biệt (ĐB):', data.results.ĐB);
        console.log('Giải Nhất (G1):', data.results.G1);
        console.log('Giải Nhì (G2):', data.results.G2);
        console.log('Giải Ba (G3):', data.results.G3);
        console.log('Giải Tư (G4):', data.results.G4);
        console.log('Giải Năm (G5):', data.results.G5);
        console.log('Giải Sáu (G6):', data.results.G6);
        console.log('Giải Bảy (G7):', data.results.G7);

        // Transform date
        const [day, month, year] = data.time.split('-');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('\n📅 Formatted Date:', formattedDate);

        console.log('\n✨ API is working perfectly!');
    })
    .catch(error => {
        console.error('❌ Error fetching data:', error.message);
    });
