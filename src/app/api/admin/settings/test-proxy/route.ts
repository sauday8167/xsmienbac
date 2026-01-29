import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { proxy_url } = await request.json();

        if (!proxy_url) {
            return NextResponse.json({ success: false, error: 'Vui lòng nhập Proxy URL' }, { status: 400 });
        }

        // Parse Proxy
        let proxyConfig;
        try {
            const url = new URL(proxy_url);
            proxyConfig = {
                protocol: url.protocol.replace(':', ''),
                host: url.hostname,
                port: parseInt(url.port) || 80,
                auth: (url.username && url.password) ? {
                    username: url.username,
                    password: url.password
                } : undefined
            };
        } catch (e) {
            return NextResponse.json({ success: false, error: 'Định dạng Proxy không hợp lệ' }, { status: 400 });
        }

        // Test Connection (Use httpbin as it's lighter and less likely to block proxies)
        const start = Date.now();
        await axios.get('http://httpbin.org/ip', {
            proxy: proxyConfig,
            timeout: 10000 // 10s
        });
        const duration = Date.now() - start;

        return NextResponse.json({
            success: true,
            message: `Kết nối thành công! (${duration}ms)`
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: `Kết nối thất bại: ${error.message}`
        }, { status: 500 });
    }
}
