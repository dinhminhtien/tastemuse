// Database types for TasteMuse
// ========================================

// ---- RESTAURANTS ----

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
    lat?: number;
    lng?: number;
    created_at: string;
    restaurant_media?: RestaurantMedia[];
    dishes?: Dish[];
    // Aggregated
    avg_rating?: number;
    rating_count?: number;
}

// ---- DISHES ----

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
    restaurants?: Restaurant;
    dish_media?: DishMedia[];
    // Aggregated
    avg_rating?: number;
    rating_count?: number;
}

// ---- RATINGS ----

export interface Rating {
    id: string;
    user_id: string;
    target_type: 'dish' | 'restaurant';
    target_id: string;
    score: number; // 1-5
    created_at: string;
    updated_at: string;
}

// ---- REVIEWS ----

export interface Review {
    id: string;
    user_id: string;
    target_type: 'dish' | 'restaurant';
    target_id: string;
    content: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    sentiment_score?: number; // -1.0 to 1.0
    is_flagged: boolean;
    created_at: string;
    updated_at: string;
    // Joined
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}

// ---- FAVORITES ----

export interface Favorite {
    id: string;
    user_id: string;
    target_type: 'dish' | 'restaurant';
    target_id: string;
    created_at: string;
}

// ---- USER INTERACTIONS ----

export type InteractionType = 'view' | 'click' | 'search' | 'chat_query' | 'share' | 'map_click';

export interface UserInteraction {
    id: string;
    user_id?: string;
    session_id?: string;
    interaction_type: InteractionType;
    target_type?: 'dish' | 'restaurant';
    target_id?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

// ---- USER TASTE PROFILES ----

export interface UserTasteProfile {
    id: string;
    user_id: string;
    taste_embedding?: number[];
    interaction_count: number;
    last_updated: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

// ---- CONVERSATION ----

export interface ConversationSession {
    id: string;
    user_id?: string;
    session_id?: string;
    title?: string;
    is_active: boolean;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface ConversationMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: {
        matched_docs?: HybridSearchResult[];
        filters?: ChatFilters;
        similarity?: number;
    };
    created_at: string;
}

// ---- CHAT TYPES ----

export interface ChatFilters {
    mood?: string;
    budget?: { min?: number; max?: number };
    maxDistance?: number;
    cuisineType?: string;
    tags?: string[];
    isSignature?: boolean;
    ward?: string;
    time?: string; // HH:mm format
}

export interface HybridSearchResult {
    document_id: string;
    source_type: string;
    source_id: string;
    title: string;
    content: string;
    semantic_similarity: number;
    avg_rating: number;
    distance_km?: number;
    hybrid_score: number;
}

// ---- API RESPONSE ----

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

// ---- TRENDING ----

export interface TrendingItem {
    target_type: string;
    target_id: string;
    trending_score: number;
    view_count: number;
    interaction_count: number;
    // Joined data
    name?: string;
    image_url?: string;
}
