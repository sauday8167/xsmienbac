import { query, queryOne } from '@/lib/db';
import type { Post } from '@/types';
import { Metadata, ResolvingMetadata } from 'next';
import PostDetailClient from './PostDetailClient';
import { notFound } from 'next/navigation';

async function getPost(slug: string): Promise<Post | null> {
    try {
        const post = await queryOne<Post>(
            'SELECT * FROM posts WHERE slug = ?',
            [slug]
        );

        if (post) {
            // Increment views
            try {
                await query('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
            } catch (error) {
                // Ignore view increment error
            }
        }

        return post;
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

async function getRelatedPosts(category: string, currentId: number): Promise<Post[]> {
    try {
        const posts = await query<Post[]>(
            'SELECT * FROM posts WHERE category = ? AND id != ? AND status = ? ORDER BY published_at DESC LIMIT 3',
            [category, currentId, 'published']
        );
        return posts || [];
    } catch (error) {
        console.error('Error fetching related posts:', error);
        return [];
    }
}

type Props = {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const post = await getPost(params.slug);

    if (!post) {
        return {
            title: 'Bài viết không tồn tại',
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';
    const postUrl = `${siteUrl}/tin-tuc/${post.slug}`;
    const imageUrl = post.thumbnail
        ? (post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`)
        : `${siteUrl}/default-share.jpg`;

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || '',
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            url: postUrl,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
                ...previousImages
            ],
            type: 'article',
            publishedTime: post.published_at || undefined,
            authors: ['XSMB'],
        },
    };
}

export default async function PostDetailPage({ params }: Props) {
    const post = await getPost(params.slug);

    if (!post) {
        return notFound();
    }

    const relatedPosts = post.category ? await getRelatedPosts(post.category, post.id) : [];

    return <PostDetailClient post={post} relatedPosts={relatedPosts} />;
}
