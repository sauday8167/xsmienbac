'use client';

import { useRouter } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/admin/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
            router.push('/admin/posts');
            router.refresh();
        } else {
            throw new Error(result.error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Viết bài mới</h1>
            <PostForm onSubmit={handleSubmit} />
        </div>
    );
}
