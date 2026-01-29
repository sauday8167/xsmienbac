'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';

export default function EditPostPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/admin/posts/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setPost(data.data);
                } else {
                    alert(data.error);
                    router.push('/admin/posts');
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id]);

    const handleSubmit = async (data: any) => {
        const res = await fetch(`/api/admin/posts/${params.id}`, {
            method: 'PUT',
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

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="spinner border-4 border-lottery-red-600 border-t-transparent w-10 h-10 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa bài viết</h1>
            <PostForm initialData={post} onSubmit={handleSubmit} isEditing />
        </div>
    );
}
