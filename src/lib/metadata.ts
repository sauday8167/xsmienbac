import { readFile } from 'fs/promises';
import { join } from 'path';

export async function getPageMetadata(pathname: string) {
    try {
        const menuPath = join(process.cwd(), 'src/data/menu-config.json');
        const sidebarPath = join(process.cwd(), 'src/data/sidebar-config.json');
        const seoPath = join(process.cwd(), 'src/data/seo-config.json');

        const [menuContent, sidebarContent, seoContent] = await Promise.all([
            readFile(menuPath, 'utf8').catch(() => '[]'),
            readFile(sidebarPath, 'utf8').catch(() => '[]'),
            readFile(seoPath, 'utf8').catch(() => '{}')
        ]);

        const menus: any = JSON.parse(menuContent);
        const sidebar = JSON.parse(sidebarContent);
        const globalSeo = JSON.parse(seoContent);

        // Merge all menu sources
        const allMenuItems = [
            ...(Array.isArray(menus.desktop) ? menus.desktop : []),
            ...(Array.isArray(menus.mobile) ? menus.mobile : []),
            ...(Array.isArray(sidebar) ? sidebar : [])
        ];

        // Find match in menu or sidebar
        const match = allMenuItems.find((item: any) => item.href === pathname);

        if (match && (match.seoTitle || match.seoDescription)) {
            return {
                title: match.seoTitle || globalSeo.homeTitle,
                description: match.seoDescription || globalSeo.homeDescription,
            };
        }

        return null;
    } catch (error) {
        return null;
    }
}
