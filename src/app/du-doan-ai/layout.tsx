import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo-helper';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
    return await getPageMetadata('/du-doan-ai');
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
