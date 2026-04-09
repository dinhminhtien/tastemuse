import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { generateEmbedding } from '@/lib/ai/gemini-ai';
import { RAG_CONFIG } from '@/lib/ai/rag-config';

// Define the payload structure expected from Supabase
interface WebhookPayload {
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    schema: string;
    record: {
        id: string;
        content: string;
        document_id: string;
        chunk_index: number;
        [key: string]: any;
    };
    old_record: any;
}

export async function POST(req: Request) {
    try {
        // 1. Verify Webhook Secret
        // You should set SUPABASE_WEBHOOK_SECRET in your Vercel Environment Variables
        // And attach ?secret=... to your webhook URL in Supabase, or use a custom header.
        const url = new URL(req.url);
        const querySecret = url.searchParams.get('secret');
        const headerSecret = req.headers.get('x-webhook-secret');

        // We check both header and query param for ease of setup
        const providedSecret = headerSecret || querySecret;
        const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

        if (expectedSecret && providedSecret !== expectedSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse payload
        const payload: WebhookPayload = await req.json();

        if (payload.table !== 'document_chunks') {
            return NextResponse.json({ message: 'Ignored (Not document_chunks)' });
        }

        if (payload.type !== 'INSERT' && payload.type !== 'UPDATE') {
            return NextResponse.json({ message: 'Ignored (Not INSERT/UPDATE)' });
        }

        const { id: chunkId, content } = payload.record;

        if (!chunkId || !content) {
            return NextResponse.json({ error: 'Missing chunkId or content' }, { status: 400 });
        }

        console.log(`[Webhook] Processing chunk ${chunkId} (${payload.type})...`);

        // 3. For UPDATE, delete old embedding first
        if (payload.type === 'UPDATE') {
            const { error: deleteErr } = await supabaseAdmin
                .from('embeddings')
                .delete()
                .eq('chunk_id', chunkId);

            if (deleteErr) {
                console.error(`[Webhook] Failed to delete old embedding for ${chunkId}`, deleteErr);
            }
        }

        // 4. Check if embedding already exists (for INSERT mainly)
        const { data: existing } = await supabaseAdmin
            .from('embeddings')
            .select('id')
            .eq('chunk_id', chunkId)
            .maybeSingle();

        if (existing) {
            console.log(`[Webhook] Embedding already exists for ${chunkId}`);
            return NextResponse.json({ message: 'Embedding already exists' });
        }

        // 5. Generate Embedding via Gemini
        console.log(`[Webhook] Calling Gemini AI for chunk ${chunkId}...`);
        const embedding = await generateEmbedding(content);

        // 6. Save to Supabase
        const { error: insertErr } = await supabaseAdmin.from('embeddings').insert({
            chunk_id: chunkId,
            embedding,
            model: RAG_CONFIG.EMBEDDING_MODEL,
        });

        if (insertErr) {
            console.error(`[Webhook] Supabase insert error for ${chunkId}:`, insertErr);
            return NextResponse.json({ error: 'Failed to insert embedding', details: insertErr.message }, { status: 500 });
        }

        console.log(`[Webhook] ✅ Successfully created embedding for ${chunkId}`);
        return NextResponse.json({ success: true, chunkId });

    } catch (error: any) {
        console.error('[Webhook] Unhandled Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
