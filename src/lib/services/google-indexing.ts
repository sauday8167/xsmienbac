/**
 * Google Indexing API Service
 * Tự động ping Google để index URL ngay sau khi đăng bài mới.
 * Yêu cầu: Service Account JSON được lưu tại GOOGLE_INDEXING_KEY_PATH
 * hoặc JSON string lưu trong GOOGLE_INDEXING_KEY env var.
 *
 * Hướng dẫn:
 * 1. Vào Google Cloud Console -> APIs & Services -> Credentials
 * 2. Tạo Service Account, cấp quyền "Owner" cho project
 * 3. Download key JSON, lưu vào file thư mục gốc: google-indexing-key.json
 * 4. Vào Google Search Console -> Settings -> Users & Permissions -> Add User (email của service account, role: Owner)
 * 5. Thêm vào .env: GOOGLE_INDEXING_KEY_PATH=./google-indexing-key.json
 */
import fs from 'fs';
import path from 'path';

interface ServiceAccountKey {
    client_email: string;
    private_key: string;
}

async function getAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
    // Build a JWT manually (no external dependencies)
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/indexing',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    })).toString('base64url');

    const signingInput = `${header}.${payload}`;

    // Sign with RS256 using Node.js crypto
    const { createSign } = await import('crypto');
    const sign = createSign('RSA-SHA256');
    sign.update(signingInput);
    const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
    const signature = sign.sign(privateKey, 'base64url');
    const jwt = `${signingInput}.${signature}`;

    // Exchange JWT for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        throw new Error(`Failed to get Google access token: ${JSON.stringify(tokenData)}`);
    }
    return tokenData.access_token;
}

function loadServiceAccount(): ServiceAccountKey | null {
    try {
        // Option 1: JSON string in env var
        if (process.env.GOOGLE_INDEXING_KEY) {
            return JSON.parse(process.env.GOOGLE_INDEXING_KEY);
        }
        // Option 2: Path to JSON file
        const keyPath = process.env.GOOGLE_INDEXING_KEY_PATH || './google-indexing-key.json';
        const absPath = path.resolve(process.cwd(), keyPath);
        if (fs.existsSync(absPath)) {
            return JSON.parse(fs.readFileSync(absPath, 'utf8'));
        }
    } catch (e) {
        console.warn('[GoogleIndexing] Failed to load service account key:', e);
    }
    return null;
}

/**
 * Ping Google Indexing API để index/re-index một URL.
 * Trả về true nếu thành công, false nếu chưa cấu hình hoặc lỗi.
 */
export async function pingGoogleIndexing(url: string): Promise<boolean> {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.info('[GoogleIndexing] Không tìm thấy Google Service Account key. Bỏ qua ping.');
        return false;
    }

    try {
        console.log(`[GoogleIndexing] Đang ping Google Indexing API cho: ${url}`);
        const accessToken = await getAccessToken(serviceAccount);

        const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, type: 'URL_UPDATED' }),
        });

        const data = await res.json();
        if (res.ok) {
            console.log(`[GoogleIndexing] ✅ Ping thành công cho ${url}`);
            return true;
        } else {
            console.warn(`[GoogleIndexing] ⚠️ Ping thất bại:`, data);
            return false;
        }
    } catch (error) {
        console.error('[GoogleIndexing] Lỗi khi ping:', error);
        return false;
    }
}
