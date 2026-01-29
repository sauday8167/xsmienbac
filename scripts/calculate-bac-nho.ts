
import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';
import { analyzeBacNho } from '../src/lib/bac-nho';
import { analyzeBacNho2Ngay } from '../src/lib/bac-nho-2-ngay';
import { analyzeBacNhoSoDon } from '../src/lib/bac-nho-so-don';
import { analyzeBacNhoCap2 } from '../src/lib/bac-nho-cap-2';
import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNho2NgayKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-2-ngay';
import { analyzeBacNhoCap2Khung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-cap-2';
import { analyzeBacNhoCap3Khung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-cap-3';
import { analyzeBacNhoSoDonKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-so-don';
import { closePool } from '../src/lib/db';

async function calculateAll() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const daysArg = args.find(arg => !isNaN(parseInt(arg)));
    const days = daysArg ? parseInt(daysArg) : 100;

    console.log(`--- STARTING BAC NHO CALCULATION (${days} DAYS) ---`);
    const startTime = Date.now();

    try {
        console.log('1. Calculating Standard Bac Nho...');
        const standard = await analyzeBacNho(days);

        console.log('2. Calculating Bac Nho 2 Ngay...');
        const haiNgay = await analyzeBacNho2Ngay(days);

        console.log('3. Calculating Bac Nho So Don...');
        const soDon = await analyzeBacNhoSoDon(days);

        console.log('4. Calculating Bac Nho Cap 2...');
        const cap2 = await analyzeBacNhoCap2(days);

        console.log('5. Calculating Bac Nho Cap 3...');
        const cap3 = await analyzeBacNhoCap3(days);

        console.log('6. Calculating Khung 3 Ngay - 2 Ngay...');
        const k3n2n = await analyzeBacNho2NgayKhung3Ngay(days);

        console.log('7. Calculating Khung 3 Ngay - Cap 2...');
        const k3nCap2 = await analyzeBacNhoCap2Khung3Ngay(days);

        console.log('8. Calculating Khung 3 Ngay - Cap 3...');
        const k3nCap3 = await analyzeBacNhoCap3Khung3Ngay(days);

        console.log('9. Calculating Khung 3 Ngay - So Don...');
        const k3nSoDon = await analyzeBacNhoSoDonKhung3Ngay(days);


        const dataDir = path.join(process.cwd(), 'src', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        // Helper to write file
        const writeStats = (name: string, content: any) => {
            // If days is 100 (default), keep original filename for backward compatibility
            // Otherwise append days: bac-nho-cap-2-365.json
            const suffix = days === 100 ? '' : `-${days}`;
            const filePath = path.join(dataDir, `bac-nho-${name}${suffix}.json`);
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            console.log(`Saved ${name} stats to ${filePath}`);
        };

        const lastUpdated = new Date().toISOString();

        writeStats('standard', { lastUpdated, data: standard });
        writeStats('2-ngay', { lastUpdated, data: haiNgay });
        writeStats('so-don', { lastUpdated, data: soDon });
        writeStats('cap-2', { lastUpdated, data: cap2 });
        writeStats('cap-3', { lastUpdated, data: cap3 });

        writeStats('khung-3-ngay-2-ngay', { lastUpdated, data: k3n2n });
        writeStats('khung-3-ngay-cap-2', { lastUpdated, data: k3nCap2 });
        writeStats('khung-3-ngay-cap-3', { lastUpdated, data: k3nCap3 });
        writeStats('khung-3-ngay-so-don', { lastUpdated, data: k3nSoDon });

        console.log(`--- SUCCESS! Stats saved to ${dataDir} (multiple files) ---`);
        console.log(`Total time: ${(Date.now() - startTime) / 1000}s`);

    } catch (error) {
        console.error('Calculation failed:', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

calculateAll();
