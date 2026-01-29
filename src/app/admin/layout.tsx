import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản Trị - XSMB',
    description: 'Trang quản trị website XSMB',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
