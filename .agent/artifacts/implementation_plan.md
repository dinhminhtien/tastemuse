# TasteMuse — Comprehensive Implementation Plan

## 📋 Current State Audit (Feb 2026)

### ✅ BUILT & WORKING
| Feature | Status | Files |
|---------|--------|-------|
| Next.js App Router (TypeScript) | ✅ working | `app/layout.tsx`, `next.config.mjs` |
| Authentication (Google OAuth + Email) | ✅ working | `lib/auth.ts`, `app/login/page.tsx`, `app/auth/callback/route.ts` |
| User Profile page (basic) | ✅ working | `app/profile/page.tsx` |
| Restaurant listing + search | ✅ working | `app/restaurants/page.tsx`, `components/restaurant-search.tsx` |
| Restaurant detail page (slug) | ✅ working | `app/restaurant/[slug]/page.tsx` |
| Dish listing + search | ✅ working | `app/dishes/page.tsx`, `components/dish-search.tsx` |
| Dish detail page (id) | ✅ working | `app/dish/[id]/page.tsx` |
| RAG Chatbot (basic) | ✅ working | `components/chatbot.tsx`, `app/api/chat/route.ts` |
| Vector search (match_documents RPC) | ✅ working | `app/api/chat/route.ts` |
| Embedding generation (gemini-embedding-001) | ✅ working | `lib/vertex-ai.ts` |
| Document sync (restaurants → docs → chunks → embeddings) | ✅ working | `lib/document-sync.ts` |
| Realtime sync listener | ✅ working | `lib/realtime-sync.ts`, `instrumentation.ts` |
| Auto-sync SQL triggers (INSERT/UPDATE) | ✅ working | `sql/auto-sync-triggers.sql` |
| Supabase Storage (for media) | ✅ working | via `restaurant_media`, `dish_media` tables |
| Vercel Analytics + Speed Insights | ✅ working | `app/layout.tsx` |
| Vietnamese UI (all pages) | ✅ working | everywhere |

### ❌ MISSING / NOT IMPLEMENTED
| Feature | Priority | Scope |
|---------|----------|-------|
| **Rating system** | 🔴 HIGH | DB table + API + UI |
| **Review system** | 🔴 HIGH | DB table + API + UI |
| **Save/Favorite system** | 🔴 HIGH | DB table + API + UI |
| **User taste embedding (dynamic)** | 🔴 HIGH | Vector + update logic |
| **Hybrid ranking algorithm** | 🔴 HIGH | Score formula in chat API |
| **Context-aware filters (mood/budget/distance/cuisine)** | 🔴 HIGH | Filter extraction in chat |
| **Geo-aware recommendations (lat/lng, distance)** | 🟡 MED | DB columns + Google Maps |
| **Google Maps integration** | 🟡 MED | Map embed on detail pages |
| **History tracking (clicks, views)** | 🟡 MED | DB table + middleware |
| **Trending engine (7-day weighted)** | 🟡 MED | SQL function + API |
| **Conversation state persistence (DB)** | 🟡 MED | DB table + chat route |
| **Review sentiment analysis** | 🟡 MED | LLM call on review submit |
| **Admin dashboard** | 🟡 MED | New page + RBAC |
| **RLS policies** | 🔴 HIGH | SQL migration |
| **API rate limiting** | 🟡 MED | Middleware |
| **Proper DB indexing** | 🟡 MED | SQL migration |

### ⚠️ BUGS / ISSUES TO FIX
1. **Env var inconsistency**: `supabase.ts` uses `NEXT_PUBLIC_TASTEMUSESUPABASE_URL` but `rag-config.ts` validates `NEXT_PUBLIC_SUPABASE_URL` — mismatch
2. **Duplicate type definitions**: `Restaurant`/`Dish` defined in both `lib/supabase.ts` and `types/database.ts`
3. **Login button CSS broken**: Line 216 has `bg-lab(49.9297 45.4562 35.4968)` instead of proper gradient
4. **Missing `lat`/`lng` on restaurants**: No geocoordinates in DB schema → can't do distance filtering
5. **No rating/review data**: Schema missing `ratings`, `reviews` tables
6. **`next.config.mjs` disables TypeScript errors**: `ignoreBuildErrors: true` — risky in production
7. **Missing `Star` import usage**: Star icon imported but no rating display on listings (no data to show)

---

## 🏗️ IMPLEMENTATION PHASES

### PHASE 1: Database Foundation (SQL Migrations)
**Goal**: Add all missing tables, columns, indexes, and RLS policies

#### 1.1 New Tables
```sql
-- ratings, reviews, favorites, user_interactions, user_taste_profiles,
-- conversation_sessions, trending_cache
```

#### 1.2 Schema Changes
```sql
-- restaurants: ADD lat FLOAT, lng FLOAT
-- user profiles table (if not exists)
```

#### 1.3 RLS Policies
```sql
-- Enable RLS on all user-facing tables
-- Policies for: ratings, reviews, favorites, user_interactions
```

#### 1.4 Indexes
```sql
-- Composite indexes for common queries
-- GiST index for geospatial queries
```

#### Files to create:
- `sql/001-ratings-reviews-favorites.sql`
- `sql/002-user-taste-profiles.sql`
- `sql/003-conversation-sessions.sql`
- `sql/004-trending-engine.sql`
- `sql/005-rls-policies.sql`
- `sql/006-indexes.sql`
- `sql/007-add-geocoordinates.sql`

---

### PHASE 2: Core API Layer
**Goal**: Build all backend API routes

#### 2.1 Rating API
- `app/api/ratings/route.ts` — POST (create), GET (list by dish/restaurant)
- `app/api/ratings/[id]/route.ts` — PATCH, DELETE

#### 2.2 Review API
- `app/api/reviews/route.ts` — POST (create with sentiment analysis), GET
- `app/api/reviews/[id]/route.ts` — PATCH, DELETE

#### 2.3 Favorites API
- `app/api/favorites/route.ts` — POST (toggle), GET (list user's favorites)

#### 2.4 User Interaction Tracking API
- `app/api/track/route.ts` — POST (track click, view, search)

#### 2.5 User Taste Embedding API
- `app/api/user-taste/route.ts` — GET (get user embedding), POST (recalculate)
- `lib/user-taste.ts` — weighted average update logic

#### 2.6 Trending API
- `app/api/trending/route.ts` — GET (trending dishes/restaurants)

#### 2.7 Conversation Sessions API
- `app/api/conversations/route.ts` — GET (list), POST (create)
- `app/api/conversations/[id]/route.ts` — GET (messages), DELETE

---

### PHASE 3: Enhanced Chatbot
**Goal**: Implement context-aware, hybrid-ranking chatbot

#### 3.1 Filter Extraction
- `lib/filter-extraction.ts` — Use LLM to extract structured filters from user message:
  ```ts
  { mood?: string, budget?: { min: number, max: number },
    maxDistance?: number, cuisineType?: string, ... }
  ```

#### 3.2 Hybrid Ranking
- `lib/hybrid-ranking.ts` — Implement:
  ```
  score = (semantic_similarity * 0.6) + (rating_score * 0.2) + (distance_score * 0.2)
  ```

#### 3.3 Conversation State Persistence
- Save/restore chat sessions from `conversation_sessions` table
- Multi-turn memory with context window

#### 3.4 Enhanced Chat API
- Update `app/api/chat/route.ts` to:
  1. Extract filters from message
  2. Generate embedding
  3. Retrieve top_k with hybrid ranking
  4. Apply distance/budget/cuisine filters
  5. Generate LLM response with structured results
  6. Save conversation state

---

### PHASE 4: UI Components
**Goal**: Build all missing frontend components

#### 4.1 Rating Component
- `components/rating-stars.tsx` — Star rating input/display
- Integrate into dish/restaurant detail pages

#### 4.2 Review Component
- `components/review-form.tsx` — Review submission form
- `components/review-list.tsx` — Display reviews with sentiment badges
- Integrate into dish/restaurant detail pages

#### 4.3 Favorite Button
- `components/favorite-button.tsx` — Heart toggle (animated)
- Replace placeholder Heart buttons on detail pages

#### 4.4 Google Maps Embed
- `components/google-map.tsx` — Map embed for restaurant location
- Integrate into restaurant detail page sidebar

#### 4.5 Trending Section
- `components/trending-dishes.tsx` — Trending widget for homepage
- `components/trending-badge.tsx` — 🔥 badge for trending items

#### 4.6 Enhanced Chatbot
- Add conversation history sidebar
- Show structured food cards in chat responses
- Add filter chips (budget, distance, mood)

---

### PHASE 5: Advanced Features
**Goal**: Implement remaining advanced features

#### 5.1 User Taste Profile
- `lib/user-taste.ts` — Update vector on:
  - Favorite toggle → `new_vector = (old * 0.7) + (food_embedding * 0.3)`
  - Rating submission → weighted by star count
  - Click/view tracking → lighter weight
  - Search embedding → extract from query

#### 5.2 Admin Dashboard
- `app/admin/page.tsx` — Protected admin page
- `app/admin/layout.tsx` — Admin layout with sidebar
- Sub-pages: restaurants, dishes, reviews, users, analytics

#### 5.3 Trending Engine
- SQL function: 7-day weighted formula
- Cron job via Vercel Cron or Supabase pg_cron

#### 5.4 History Tracking
- Middleware for click/view tracking
- `app/profile/history/page.tsx` — User's browsing history

---

### PHASE 6: Performance & Security
**Goal**: Production hardening

#### 6.1 RLS Policies (SQL)
- Users can only read/write their own data
- Public read for restaurants, dishes, reviews
- Admin-only write for restaurants, dishes

#### 6.2 API Rate Limiting
- `lib/rate-limit.ts` — Token bucket per IP/user
- Apply to chat API, rating API, review API

#### 6.3 Database Indexes
- Composite indexes on frequently queried columns
- GiST index on `(lat, lng)` for geo queries
- B-tree indexes on `created_at`, `restaurant_id`, `dish_id`

#### 6.4 Edge Functions
- Move embedding generation to Supabase Edge Functions
- Queue-based async processing

---

## 📁 New Files Summary

### SQL Migrations (7 files)
```
sql/001-ratings-reviews-favorites.sql
sql/002-user-taste-profiles.sql
sql/003-conversation-sessions.sql
sql/004-trending-engine.sql
sql/005-rls-policies.sql
sql/006-indexes.sql
sql/007-add-geocoordinates.sql
```

### Library Modules (5 files)
```
lib/filter-extraction.ts
lib/hybrid-ranking.ts
lib/user-taste.ts
lib/rate-limit.ts
lib/google-maps.ts
```

### API Routes (10+ files)
```
app/api/ratings/route.ts
app/api/ratings/[id]/route.ts
app/api/reviews/route.ts
app/api/reviews/[id]/route.ts
app/api/favorites/route.ts
app/api/track/route.ts
app/api/user-taste/route.ts
app/api/trending/route.ts
app/api/conversations/route.ts
app/api/conversations/[id]/route.ts
```

### Components (8+ files)
```
components/rating-stars.tsx
components/review-form.tsx
components/review-list.tsx
components/favorite-button.tsx
components/google-map.tsx
components/trending-dishes.tsx
components/trending-badge.tsx
components/chat-food-card.tsx
```

### Pages (3+ files)
```
app/admin/page.tsx
app/admin/layout.tsx
app/profile/history/page.tsx
```

### Type Updates (1 file)
```
types/database.ts (expanded)
```

---

## 🔧 Bug Fixes (Immediate)

1. Fix env var mismatch in `rag-config.ts`
2. Fix login button CSS (line 216)
3. Consolidate duplicate types
4. Consider removing `ignoreBuildErrors: true`
