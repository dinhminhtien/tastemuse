import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables

// Main RAG document type
export interface Document {
  id: string;
  source_type: 'restaurant' | 'dish';
  source_id: string;
  title: string;
  raw_content: string;
  metadata: {
    city?: string;
    ward?: string;
    tags?: string[];
    min_price?: number;
    max_price?: number;
    open_time?: string;
    close_time?: string;
  };
  created_at: string;
}

// Document chunks for RAG (actual schema)
export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  created_at: string;
}

// Embeddings table (actual schema)
export interface Embedding {
  id: string;
  chunk_id: string;
  embedding: number[];
  model: string;
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
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  normalized_name: string;
  is_signature: boolean;
  created_at: string;
}

// Legacy types (kept for backward compatibility)
export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurant_id: string;
  image_url?: string;
  category?: string;
  created_at: string;
}

export interface FoodEmbedding {
  id: string;
  food_id: string;
  embedding: number[];
  created_at: string;
}

export interface RestaurantEmbedding {
  id: string;
  restaurant_id: string;
  embedding: number[];
  created_at: string;
}

// Match result type from similarity search (for chunks)
export interface ChunkMatch {
  chunk_id: string;
  document_id: string;
  similarity: number;
  content: string;
}

// Match result type for documents
export interface DocumentMatch {
  document_id: string;
  similarity: number;
  source_type: string;
  source_id: string;
  title: string;
  content: string;
}

export interface FoodMatch {
  id: string;
  food_id: string;
  similarity: number;
}
