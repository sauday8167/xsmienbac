import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Metadata } from 'next';

interface MenuItem {
    id: string;
    label: string;
    href: string;
    description: string;
    seoTitle?: string;
    seoDescription?: string;
}

interface MenuConfig {
    desktop: MenuItem[];
    mobile: MenuItem[];
}

interface SidebarItem {
    href: string;
    seoTitle?: string;
    seoDescription?: string;
    label: string;
}

/**
 * Get page metadata from menu-config.json and sidebar-config.json
 * Priority: Menu > Sidebar
 * @param pathname - The page pathname (e.g., '/du-doan-ai')
 * @returns Metadata object for the page
 */
export async function getPageMetadata(pathname: string): Promise<Metadata> {
    try {
        const cwd = process.cwd();
        const menuPath = join(cwd, 'src/data/menu-config.json');
        const sidebarPath = join(cwd, 'src/data/sidebar-config.json');

        // Parallel read
        const [menuContent, sidebarContent] = await Promise.all([
            readFile(menuPath, 'utf8').catch(() => '{"desktop":[],"mobile":[]}'),
            readFile(sidebarPath, 'utf8').catch(() => '[]')
        ]);

        let menuConfig: MenuConfig = { desktop: [], mobile: [] };
        try {
            const parsed = JSON.parse(menuContent);
            if (Array.isArray(parsed)) {
                menuConfig = { desktop: parsed, mobile: parsed };
            } else {
                menuConfig = { ...menuConfig, ...parsed };
            }
        } catch (e) {
            // ignore parse error use default
        }

        const sidebarItems: SidebarItem[] = JSON.parse(sidebarContent);

        // 1. Check Menu (Desktop first)
        const allMenuItems = [...(menuConfig.desktop || []), ...(menuConfig.mobile || [])];
        const menuItem = allMenuItems.find(i => i.href === pathname);

        if (menuItem && menuItem.seoTitle) {
            return formatMetadata(menuItem.seoTitle, menuItem.seoDescription);
        }

        // 2. Check Sidebar
        const sidebarItem = sidebarItems.find(i => i.href === pathname);
        if (sidebarItem && sidebarItem.seoTitle) {
            return formatMetadata(sidebarItem.seoTitle, sidebarItem.seoDescription);
        }

        // Fallback to label if no SEO data
        if (menuItem) return formatMetadata(`${menuItem.label} - XSMB`);
        if (sidebarItem) return formatMetadata(`${sidebarItem.label} - XSMB`);

        // Ultimate fallback
        return formatMetadata('XSMB - Kết Quả Xổ Số Miền Bắc');

    } catch (error) {
        console.error('Error loading SEO config:', error);
        return formatMetadata('XSMB - Kết Quả Xổ Số Miền Bắc');
    }
}

function formatMetadata(title: string, description?: string): Metadata {
    return {
        title,
        description: description || '',
        openGraph: {
            title,
            description: description || '',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: description || '',
        },
    };
}
