// Lottery Result Types
export interface LotteryResult {
    id: number;
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string[];
    prize_3: string[];
    prize_4: string[];
    prize_5: string[];
    prize_6: string[];
    prize_7: string[];
    created_at: string;
    updated_at: string;
}

export interface LotteryResultRaw {
    id: number;
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string;
    prize_3: string;
    prize_4: string;
    prize_5: string;
    prize_6: string;
    prize_7: string;
    created_at: string;
    updated_at: string;
}

// Post Types
export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    thumbnail: string | null;
    category: 'news' | 'soi-cau' | 'tips' | 'analysis';
    meta_title: string | null;
    meta_description: string | null;
    status: 'draft' | 'published' | 'archived';
    views: number;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

// Admin Types
export interface Admin {
    id: number;
    username: string;
    password_hash: string;
    full_name: string | null;
    email: string | null;
    role: 'super_admin' | 'admin' | 'editor';
    is_active: boolean;
    last_login: string | null;
    created_at: string;
    updated_at: string;
}

// Statistics Types
export interface NumberFrequency {
    number: string;
    count: number;
    lastSeen: string;
}

export interface LotoStats {
    dau: { [key: string]: NumberFrequency[] }; // 0-9
    duoi: { [key: string]: NumberFrequency[] }; // 0-9
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
