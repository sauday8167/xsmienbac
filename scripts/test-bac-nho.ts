
import 'tsconfig-paths/register';
import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNho2Ngay } from '../src/lib/bac-nho-2-ngay';
import { analyzeBacNhoCap3Khung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-cap-3';
import { analyzeBacNho2NgayKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-2-ngay';
import { closePool } from '../src/lib/db';

async function test() {
    console.log("Testing Bac Nho Logic...");
    const days = 100;

    try {
        console.log("1. Testing Bac Nho Cap 3 (Default)...");
        const res1 = await analyzeBacNhoCap3(days);
        console.log("   Success. Patterns found:", res1.patterns.length);
        if (res1.patterns.length > 0) {
            console.log("   Sample pattern:", JSON.stringify(res1.patterns[0].triggerTriple));
        }
    } catch (e) {
        console.error("   FAILED Bac Nho Cap 3:", e);
    }

    try {
        console.log("2. Testing Bac Nho 2 Ngay (Default)...");
        const res2 = await analyzeBacNho2Ngay(days);
        console.log("   Success. Patterns found:", res2.patterns.length);
        if (res2.patterns.length > 0) {
            console.log("   Sample pattern:", JSON.stringify(res2.patterns[0].triggerPair));
        }
    } catch (e) {
        console.error("   FAILED Bac Nho 2 Ngay:", e);
    }

    try {
        console.log("3. Testing Bac Nho Khung 3 Ngay - Cap 3...");
        const res3 = await analyzeBacNhoCap3Khung3Ngay(days);
        console.log("   Success. Patterns found:", res3.patterns.length);
        if (res3.patterns.length > 0) {
            console.log("   Sample pattern:", JSON.stringify(res3.patterns[0].triggerTriple));
        }
    } catch (e) {
        console.error("   FAILED Bac Nho Khung 3 Ngay - Cap 3:", e);
    }

    try {
        console.log("4. Testing Bac Nho Khung 3 Ngay - 2 Ngay...");
        const res4 = await analyzeBacNho2NgayKhung3Ngay(days);
        console.log("   Success. Patterns found:", res4.patterns.length);
        if (res4.patterns.length > 0) {
            console.log("   Sample pattern:", JSON.stringify(res4.patterns[0].triggerPair));
        }
    } catch (e) {
        console.error("   FAILED Bac Nho Khung 3 Ngay - 2 Ngay:", e);
    }

    await closePool();
}

test();
