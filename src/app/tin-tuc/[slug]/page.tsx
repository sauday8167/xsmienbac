import { query, queryOne } from '@/lib/db';
import type { Post } from '@/types';
import { Metadata, ResolvingMetadata } from 'next';
import PostDetailClient from './PostDetailClient';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import { linkify } from '@/lib/internal-linker';
import { processContentImages } from '@/lib/image-seo';

async function getPost(slug: string): Promise<Post | null> {
    try {
        const post = await queryOne<Post>(
            'SELECT *, thumbnail_url as thumbnail FROM posts WHERE slug = ?',
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
            'SELECT *, thumbnail_url as thumbnail FROM posts WHERE category = ? AND id != ? AND status = ? ORDER BY published_at DESC LIMIT 3',
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

    // Use Dynamic OG Image
    const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}&date=${encodeURIComponent(new Date(post.created_at).toLocaleDateString('vi-VN'))}`;

    const imageUrl = post.thumbnail
        ? (post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`)
        : ogImageUrl;

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
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        twitter: {
            card: 'summary_large_image',
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || '',
            images: [imageUrl],
        },
        alternates: {
            canonical: postUrl,
        },
    };
}

export default async function PostDetailPage({ params }: Props) {
    const post = await getPost(params.slug);

    if (!post) {
        return notFound();
    }

    // Process content for Auto Internal Linking
    post.content = linkify(post.content);

    // Process content for Auto Image SEO
    post.content = processContentImages(post.content, post.title);

    const relatedPosts = post.category ? await getRelatedPosts(post.category, post.id) : [];

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Tin tức', item: '/tin-tuc' },
        { name: post.title, item: `/tin-tuc/${post.slug}` }
    ];

    return (
        <>
            <JsonLd data={generateArticleSchema(post)} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <PostDetailClient post={post} relatedPosts={relatedPosts} />
        </>
    );
}
