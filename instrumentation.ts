/**
 * Next.js Instrumentation
 *
 * This file runs ONCE when the Next.js server starts.
 * We use it to boot the Supabase Realtime listener that
 * auto-generates embeddings for new document chunks.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
    // Only run on the server (Node.js runtime), not in the Edge runtime
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('\n========================================');
        console.log('🍜 TasteMuse Server Starting...');
        console.log('========================================\n');

        try {
            // Dynamic import to avoid bundling issues
            const { startRealtimeSync } = await import('@/lib/realtime-sync');
            await startRealtimeSync();
        } catch (error) {
            console.error('❌ Failed to start Realtime Sync:', error);
            // Don't crash the server — sync is non-critical
        }
    }
}
