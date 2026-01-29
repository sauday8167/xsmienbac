import Link from 'next/link';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Facebook, Youtube, MessageCircle, Send, Mail, Phone, MapPin } from 'lucide-react';

async function getFooterConfig() {
    // ... existing code ...
    try {
        const filePath = join(process.cwd(), 'src/data/footer-config.json');
        if (existsSync(filePath)) {
            const data = await readFile(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading footer config:', e);
    }
    // Fallback
    return {
        about: {
            title: "Về XSMB",
            content: "Website cung cấp kết quả xổ số miền Bắc trực tiếp, nhanh chóng và chính xác nhất. Cập nhật tự động lúc 18:15 hàng ngày."
        },
        socials: { facebook: "", youtube: "", telegram: "", zalo: "" },
        contact: { email: "", phone: "", address: "" },
        quickLinks: {
            title: "Liên kết nhanh",
            links: [
                { label: "Trang chủ", href: "/" },
                { label: "Kết quả theo ngày", href: "/ket-qua-theo-ngay" },
                { label: "Thống kê", href: "/thong-ke" },
                { label: "Tin tức / Soi cầu", href: "/tin-tuc" }
            ]
        },
        disclaimer: {
            title: "Lưu ý",
            content: "Thông tin chỉ mang tính chất tham khảo. Vui lòng đối chiếu với kết quả chính thức từ công ty xổ số.",
            highlight: "Chơi có trách nhiệm - Cảnh giác trò chơi may rủi!"
        },
        copyright: `© ${new Date().getFullYear()} XSMB - Xổ Số Miền Bắc. All rights reserved.`
    };
}

interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    position: string;
    status: string;
}

interface Ad {
    id: string;
    name: string;
    code: string;
    position: string;
    status: string;
}

export default async function Footer() {
    const config = await getFooterConfig();
    const currentYear = new Date().getFullYear();

    // Fetch banners and ads server-side
    let banners: Banner[] = [];
    let ads: Ad[] = [];
    try {
        const bannersData = await readFile(join(process.cwd(), 'src/data/banners.json'), 'utf8');
        banners = JSON.parse(bannersData).filter((b: Banner) => b.position === 'footer' && b.status === 'active');

        const adsData = await readFile(join(process.cwd(), 'src/data/ads.json'), 'utf8');
        ads = JSON.parse(adsData).filter((a: Ad) => a.position === 'footer' && a.status === 'active');
    } catch (e) {
        console.error('Error loading footer banners/ads:', e);
    }

    return (
        <footer className="bg-lottery-gray-800 text-white mt-12">
            {/* Footer Ads */}
            {ads.length > 0 && (
                <div className="bg-white py-4 border-b border-gray-200">
                    <div className="container mx-auto px-4 flex flex-col items-center gap-4">
                        {ads.map(ad => (
                            <div key={ad.id} className="w-full max-w-4xl" dangerouslySetInnerHTML={{ __html: ad.code }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Banners */}
            {banners.length > 0 && (
                <div className="bg-gray-900/50 py-8 border-b border-gray-700">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {banners.map(banner => (
                                <a
                                    key={banner.id}
                                    href={banner.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-lg overflow-hidden border border-gray-700 hover:border-lottery-gold-500 transition-colors"
                                >
                                    <img src={banner.image} alt={banner.title} className="w-full h-auto object-cover" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-lottery-gold-400">{config.about.title}</h3>
                        <p className="text-lottery-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {config.about.content}
                        </p>

                        {/* Contact Info if available */}
                        {(config.contact?.email || config.contact?.phone) && (
                            <div className="mt-4 text-sm text-lottery-gray-400 space-y-1">
                                {config.contact.email && <div>Email: {config.contact.email}</div>}
                                {config.contact.phone && <div>Phone: {config.contact.phone}</div>}
                                {config.contact.address && <div>Address: {config.contact.address}</div>}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-lottery-gold-400">{config.quickLinks.title}</h3>
                        <ul className="space-y-2 text-sm">
                            {config.quickLinks.links.map((link: any, index: number) => (
                                <li key={index}>
                                    <Link href={link.href} className="text-lottery-gray-300 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-lottery-gold-400">Kết nối với chúng tôi</h3>
                        <div className="flex space-x-4">
                            {config.socials.facebook && (
                                <a href={config.socials.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {config.socials.youtube && (
                                <a href={config.socials.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <Youtube className="w-5 h-5" />
                                </a>
                            )}
                            {config.socials.zalo && (
                                <a href={config.socials.zalo} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </a>
                            )}
                            {config.socials.telegram && (
                                <a href={config.socials.telegram} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <Send className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-lottery-gold-400">{config.disclaimer.title}</h3>
                        <p className="text-lottery-gray-300 text-sm leading-relaxed">
                            {config.disclaimer.content}
                            <span className="block mt-2 text-lottery-red-400 font-semibold">
                                {config.disclaimer.highlight}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-lottery-gray-700 mt-8 pt-6 text-center">
                    <p className="text-lottery-gray-400 text-sm">
                        {config.copyright.replace('{year}', currentYear.toString())}
                    </p>
                </div>
            </div>
        </footer>
    );
}
