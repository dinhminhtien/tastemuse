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
            // NOTE: We have migrated away from startRealtimeSync() inside instrumentation.
            // On Vercel (Serverless), background WebSockets listening for Supabase changes 
            // will block the execution or simply get suspended.
            // We now use Supabase Database Webhooks calling into /api/webhooks/embeddings
            console.log('✅ Application bootstrapped successfully.');
        } catch (error) {
            console.error('❌ Failed to bootstrap application:', error);
        }
    }
}
