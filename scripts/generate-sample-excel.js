const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const outputPath = path.resolve(__dirname, '../public/sample_import_xsmb.xlsx');

const headers = [
    'ngay',
    'dac_biet',
    'giai_1',
    'giai_2',
    'giai_3',
    'giai_4',
    'giai_5',
    'giai_6',
    'giai_7'
];

const data = [
    {
        ngay: '2026-01-01',
        dac_biet: '12345',
        giai_1: '67890',
        giai_2: '11111, 22222',
        giai_3: '33333, 44444, 55555, 66666, 77777, 88888',
        giai_4: '1234, 5678, 9012, 3456',
        giai_5: '1111, 2222, 3333, 4444, 5555, 6666',
        giai_6: '123, 456, 789',
        giai_7: '11, 22, 33, 44'
    },
    {
        ngay: '2026-01-02',
        dac_biet: '54321',
        giai_1: '09876',
        giai_2: '12312, 45645',
        giai_3: '11223, 33445, 55667, 77889, 99001, 22334',
        giai_4: '0000, 1111, 2222, 3333',
        giai_5: '4444, 5555, 6666, 7777, 8888, 9999',
        giai_6: '987, 654, 321',
        giai_7: '99, 88, 77, 66'
    }
];

try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    ws['!cols'] = [
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 20 },
        { wch: 50 },
        { wch: 30 },
        { wch: 50 },
        { wch: 20 },
        { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Lieu');

    // Ensure public dir exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write using buffer to be safe
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(outputPath, buffer);
    console.log(`Sample Excel created at: ${outputPath}`);

    // Verify
    const verifyWb = XLSX.readFile(outputPath);
    if (verifyWb.SheetNames.length > 0) {
        console.log('Verification Success: File is a valid Excel.');
    } else {
        console.error('Verification Failed: File seems empty.');
    }

} catch (e) {
    console.error('Error generating Excel:', e);
}
