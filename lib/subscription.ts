/**
 * Subscription & Usage Limit Logic
 * TasteMuse – Freemium Layer
 *
 * Core functions for checking user plans, enforcing usage limits,
 * and logging AI usage.
 */

import { supabaseAdmin } from './supabase';
import type { Plan, Subscription, UserPlanInfo } from '@/types/database';

// ─── Cache for free plan (avoid repeated DB lookups) ───
let cachedFreePlan: Plan | null = null;

/**
 * Get the free plan definition (cached)
 */
async function getFreePlan(): Promise<Plan> {
    if (cachedFreePlan) return cachedFreePlan;

    const { data, error } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('name', 'free')
        .single();

    if (error || !data) {
        // Fallback defaults if DB isn't seeded yet
        return {
            id: 'free-fallback',
            name: 'free',
            display_name: 'Miễn phí',
            price: 0,
            duration_days: 0,
            ai_limit_per_day: 10,
            features_json: {
                ai_chat: true,
                ai_chat_limit: 10,
                basic_search: true,
                view_reviews: true,
                basic_recommendations: true,
                personalized_recommendations: false,
                ai_review_summary: false,
                save_favorites: false,
                advanced_filters: false,
                meal_planning: false,
                unlimited_ai: false,
            },
            is_active: true,
            created_at: new Date().toISOString(),
        };
    }

    cachedFreePlan = data as Plan;
    return cachedFreePlan;
}

/**
 * Get a user's current plan and subscription info
 */
export async function getUserPlan(userId: string): Promise<UserPlanInfo> {
    // Find the user's active subscription
    const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', userId)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (subscription && subscription.plans) {
        const plan = subscription.plans as unknown as Plan;
        const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
        const now = new Date();

        // Check if subscription has expired
        if (endDate && endDate < now) {
            // Mark as expired
            await supabaseAdmin
                .from('subscriptions')
                .update({ status: 'expired' })
                .eq('id', subscription.id);

            // Fall through to free plan
        } else {
            const daysRemaining = endDate
                ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;

            return {
                plan,
                subscription: subscription as unknown as Subscription,
                isFreePlan: plan.name === 'free',
                isPremium: plan.name === 'premium',
                isTrial: subscription.is_trial || false,
                daysRemaining,
            };
        }
    }

    // Default to free plan
    const freePlan = await getFreePlan();
    return {
        plan: freePlan,
        subscription: null,
        isFreePlan: true,
        isPremium: false,
        isTrial: false,
        daysRemaining: null,
    };
}

/**
 * Check if user has remaining usage for a given action type
 * Returns { allowed, used, limit, remaining }
 */
export async function checkUsageLimit(
    userId: string,
    actionType: string = 'ai_chat'
): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    isPremium: boolean;
}> {
    const userPlan = await getUserPlan(userId);
    const limit = userPlan.plan.ai_limit_per_day;

    // Premium / unlimited plan
    if (limit === -1) {
        return {
            allowed: true,
            used: 0,
            limit: -1,
            remaining: -1,
            isPremium: true,
        };
    }

    // Get today's usage count
    const { data, error } = await supabaseAdmin.rpc('get_daily_usage_count', {
        p_user_id: userId,
        p_action_type: actionType,
    });

    const used = error ? 0 : (data as number);
    const remaining = Math.max(0, limit - used);

    return {
        allowed: used < limit,
        used,
        limit,
        remaining,
        isPremium: false,
    };
}

/**
 * Log a usage event
 */
export async function logUsage(
    userId: string,
    actionType: string,
    metadata: Record<string, unknown> = {}
): Promise<void> {
    await supabaseAdmin
        .from('usage_logs')
        .insert({
            user_id: userId,
            action_type: actionType,
            metadata,
        });
}

/**
 * Check if a user can use a specific feature
 */
export async function canUseFeature(
    userId: string,
    feature: string
): Promise<boolean> {
    const userPlan = await getUserPlan(userId);
    return !!userPlan.plan.features_json[feature];
}

/**
 * Get usage statistics for a user
 */
export async function getUsageStats(userId: string): Promise<{
    ai_chat: { used: number; limit: number; remaining: number };
    plan: string;
    isPremium: boolean;
}> {
    const userPlan = await getUserPlan(userId);
    const limit = userPlan.plan.ai_limit_per_day;

    let used = 0;
    if (limit !== -1) {
        const { data } = await supabaseAdmin.rpc('get_daily_usage_count', {
            p_user_id: userId,
            p_action_type: 'ai_chat',
        });
        used = (data as number) || 0;
    }

    return {
        ai_chat: {
            used,
            limit,
            remaining: limit === -1 ? -1 : Math.max(0, limit - used),
        },
        plan: userPlan.plan.name,
        isPremium: userPlan.isPremium,
    };
}

/**
 * Start a free trial for a user
 */
export async function startFreeTrial(userId: string): Promise<Subscription | null> {
    // Check if user already had a trial
    const { data: existingTrial } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_trial', true)
        .limit(1)
        .maybeSingle();

    if (existingTrial) {
        return null; // Already used trial
    }

    // Get premium plan
    const { data: premiumPlan } = await supabaseAdmin
        .from('plans')
        .select('id')
        .eq('name', 'premium')
        .single();

    if (!premiumPlan) return null;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 3-day trial

    // Cancel any existing active/trial subscriptions first
    await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .in('status', ['active', 'trial']);

    const { data: subscription, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
            user_id: userId,
            plan_id: premiumPlan.id,
            status: 'trial',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_trial: true,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to start trial:', error);
        return null;
    }

    return subscription as unknown as Subscription;
}
