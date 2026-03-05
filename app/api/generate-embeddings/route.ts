import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/gemini-ai';
import { RAG_CONFIG } from '@/lib/rag-config';

/**
 * API route to generate embeddings for documents
 * GET /api/generate-embeddings - Generate embeddings for all documents
 */
export async function GET(req: NextRequest) {
    try {
        console.log('🚀 Starting embedding generation...\n');

        // Step 1: Fetch all documents
        const { data: documents, error: fetchError } = await supabase
            .from('documents')
            .select('*');

        if (fetchError) {
            throw new Error(`Failed to fetch documents: ${fetchError.message}`);
        }

        if (!documents || documents.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No documents found',
            });
        }

        console.log(`✅ Found ${documents.length} documents\n`);

        let results = {
            totalDocuments: documents.length,
            chunksCreated: 0,
            embeddingsCreated: 0,
            errors: [] as string[],
        };

        // Step 2: Process each document
        for (const doc of documents) {
            try {
                // Check if chunk already exists
                const { data: existingChunk } = await supabase
                    .from('document_chunks')
                    .select('id')
                    .eq('document_id', doc.id)
                    .single();

                let chunkId = existingChunk?.id;

                if (!existingChunk) {
                    // Create chunk
                    const { data: newChunk, error: chunkError } = await supabase
                        .from('document_chunks')
                        .insert({
                            document_id: doc.id,
                            chunk_index: 0,
                            content: doc.raw_content,
                        })
                        .select('id')
                        .single();

                    if (chunkError) {
                        throw new Error(`Failed to create chunk: ${chunkError.message}`);
                    }

                    chunkId = newChunk.id;
                    results.chunksCreated++;
                    console.log(`✅ Created chunk for: ${doc.title}`);
                }

                // Check if embedding already exists
                const { data: existingEmbedding } = await supabase
                    .from('embeddings')
                    .select('id')
                    .eq('chunk_id', chunkId)
                    .single();

                if (existingEmbedding) {
                    console.log(`⏭️  Embedding exists for: ${doc.title}`);
                    continue;
                }

                // Generate embedding
                console.log(`🔄 Generating embedding for: ${doc.title}`);
                const embedding = await generateEmbedding(doc.raw_content);

                // Save embedding
                const { error: embeddingError } = await supabase
                    .from('embeddings')
                    .insert({
                        chunk_id: chunkId,
                        embedding,
                        model: RAG_CONFIG.EMBEDDING_MODEL,
                    });

                if (embeddingError) {
                    throw new Error(`Failed to save embedding: ${embeddingError.message}`);
                }

                results.embeddingsCreated++;
                console.log(`✅ Embedding created for: ${doc.title}\n`);

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, RAG_CONFIG.BATCH_DELAY_MS));

            } catch (error: any) {
                console.error(`❌ Error processing ${doc.title}:`, error.message);
                results.errors.push(`${doc.title}: ${error.message}`);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`Total documents: ${results.totalDocuments}`);
        console.log(`Chunks created: ${results.chunksCreated}`);
        console.log(`Embeddings created: ${results.embeddingsCreated}`);
        console.log(`Errors: ${results.errors.length}\n`);

        return NextResponse.json({
            success: true,
            message: 'Embedding generation completed',
            results,
        });

    } catch (error: any) {
        console.error('❌ Fatal error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
