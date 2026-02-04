// Database types for TasteMuse

// RestaurantMedia - defined first so it can be used in Restaurant
export interface RestaurantMedia {
    id: string;
    restaurant_id: string;
    media_type: 'image' | 'video';
    media_url: string;
    thumbnail_url?: string;
    is_cover: boolean;
    display_order: number;
    created_at: string;
}

export interface Restaurant {
    id: string;
    name: string;
    normalized_name: string;
    slug: string;
    address: string;
    ward: string;
    city: string;
    phone?: string;
    tags: string[];
    description: string;
    is_active: boolean;
    open_time?: string;
    close_time?: string;
    min_price?: number;
    max_price?: number;
    created_at: string;
    restaurant_media?: RestaurantMedia[]; // For joined queries
}

// DishMedia - for dish images/videos
export interface DishMedia {
    id: string;
    dish_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    is_primary: boolean;
    sort_order: number;
    alt_text?: string;
    created_at: string;
}

export interface Dish {
    id: string;
    restaurant_id: string;
    name: string;
    normalized_name: string;
    is_signature: boolean;
    created_at: string;
    restaurants?: Restaurant; // For joined queries
    dish_media?: DishMedia[]; // For joined queries
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    count?: number;
    pagination?: {
        limit: number;
        offset: number;
    };
}
