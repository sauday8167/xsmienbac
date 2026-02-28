import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import AdPopup from '@/components/AdPopup'
import MobileBottomNav from '@/components/MobileBottomNav'
import '@/app/cron-init'

import { readFile } from 'fs/promises';
import { join } from 'path';

import { UIProvider } from '@/context/UIContext';
import { AdSenseProvider } from '@/context/AdSenseContext';
import MobileDrawer from '@/components/MobileDrawer';
import MobileStickyAd from '@/components/MobileStickyAd';
import CustomCodeInjector from '@/components/CustomCodeInjector';
import JsonLd from '@/components/seo/JsonLd';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/schema-generator';

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const viewport = {
    themeColor: '#dc2626',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
    const configPath = join(process.cwd(), 'src/data/seo-config.json');
    let seoConfig = {
        ogImage: '/logo-v5.png',
        siteUrl: 'https://xosomienbac24h.com'
    };

    try {
        const content = await readFile(configPath, 'utf8');
        seoConfig = { ...seoConfig, ...JSON.parse(content) };
    } catch (e) {
        console.error('Failed to load SEO config in layout');
    }

    let brandingConfig = { favicon: '' };
    try {
        const brandingPath = join(process.cwd(), 'src/data/branding.json');
        const content = await readFile(brandingPath, 'utf8');
        brandingConfig = JSON.parse(content);
    } catch (e) {
        // Ignore if file doesn't exist
    }

    const siteUrl = seoConfig.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';
    let ogImage = seoConfig.ogImage || '/logo-v5.png';

    // Ensure ogImage is absolute
    if (ogImage.startsWith('/')) {
        ogImage = `${siteUrl}${ogImage}`;
    }

    // Load Custom Code for Verification Tags (Google Search Console)
    let customCode = { header: '' };
    try {
        const customCodePath = join(process.cwd(), 'src/data/custom-code.json');
        const content = await readFile(customCodePath, 'utf8');
        customCode = JSON.parse(content);
    } catch (e) {
        // Ignore
    }

    // Extract Google Verification Code
    let googleVerification = null;
    if (customCode.header) {
        // Look for <meta name="google-site-verification" content="..." />
        const match = customCode.header.match(/name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
        if (match && match[1]) {
            googleVerification = match[1];
        }
    }

    // Only set metadataBase and default OG image
    // Each page will have its own title/description
    return {
        metadataBase: new URL(siteUrl),
        // Homepage metadata (fallback for /)
        title: 'XSMB - Kết Quả Xổ Số Miền Bắc Hôm Nay - SXMB Chính Xác',
        description: 'Xem kết quả xổ số miền Bắc (XSMB) hôm nay nhanh nhất, chính xác nhất. Thống kê loto, soi cầu, phân tích chuyên sâu các cặp số đẹp hàng ngày.',
        keywords: 'xsmb, xổ số miền bắc, sxmb, kqxs miền bắc, kết quả xổ số',
        verification: {
            google: googleVerification || undefined,
        },
        openGraph: {
            type: 'website',
            siteName: 'XSMB 24h',
            locale: 'vi_VN',
            url: siteUrl,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: 'XSMB - Kết Quả Xổ Số Miền Bắc',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'XSMB - Kết Quả Xổ Số Miền Bắc Hôm Nay',
            description: 'Xem kết quả xổ số miền Bắc (XSMB) hôm nay nhanh nhất, chính xác nhất.',
            images: [ogImage],
        },
        alternates: {
            canonical: siteUrl,
        },
        icons: {
            icon: [
                { url: '/favicon.png', type: 'image/png' },
                { url: brandingConfig.favicon || '/favicon.png' }, // Fallback to uploaded one if needed, but prefer stable
            ],
            shortcut: '/favicon.png',
            apple: '/favicon.png',
        },
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let customCode = { header: '', footer: '' };
    try {
        const configPath = join(process.cwd(), 'src/data/custom-code.json');
        const content = await readFile(configPath, 'utf8');
        customCode = JSON.parse(content);
    } catch (e) {
        // Fallback
    }

    // Load SEO Config for Google Analytics
    let seoConfig = { googleAnalyticsId: '' };
    try {
        const configPath = join(process.cwd(), 'src/data/seo-config.json');
        const content = await readFile(configPath, 'utf8');
        seoConfig = JSON.parse(content);
    } catch (e) {
        // Ignore
    }

    return (
        <html lang="vi">
            {/* ... head ... */}
            <body className={inter.className}>
                <JsonLd data={generateOrganizationSchema()} />
                <JsonLd data={generateWebSiteSchema()} />
                {seoConfig.googleAnalyticsId && (
                    <>
                        <script
                            async
                            src={`https://www.googletagmanager.com/gtag/js?id=${seoConfig.googleAnalyticsId}`}
                        />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${seoConfig.googleAnalyticsId}');
                                `
                            }}
                        />
                    </>
                )}

                {/* Google AdSense Script */}
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
                    crossOrigin="anonymous"
                />

                <UIProvider>
                    <AdSenseProvider>
                        {customCode.header && (
                            <CustomCodeInjector id="header-custom-code" html={customCode.header} />
                        )}

                        <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0">
                            <Header />
                            <main className="flex-grow container mx-auto px-2 md:px-4 py-4 md:py-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                                    <div className="lg:col-span-8">
                                        {children}
                                    </div>
                                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                                        <Sidebar />
                                    </div>
                                </div>
                            </main>
                            <Footer />
                        </div>


                        <AdPopup />
                        <MobileStickyAd />
                        <MobileBottomNav />
                        <MobileDrawer />

                        {customCode.footer && (
                            <CustomCodeInjector id="footer-custom-code" html={customCode.footer} />
                        )}
                    </AdSenseProvider>
                </UIProvider>
            </body>
        </html>
    )
}


