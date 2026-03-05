import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
    getUserConversations,
    createConversation,
    getConversationWithMessages,
    updateConversationTitle,
    deleteConversation,
} from '@/lib/chat-history';

/**
 * Authenticate user from request
 */
async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
    );
    return user;
}

/**
 * GET /api/chat/conversations
 * List all conversations for the authenticated user
 * 
 * GET /api/chat/conversations?id=<uuid>
 * Get a specific conversation with messages
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('id');

        if (conversationId) {
            // Get specific conversation with messages
            const result = await getConversationWithMessages(conversationId, user.id);
            if (!result) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            return NextResponse.json(result);
        }

        // List all conversations
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const conversations = await getUserConversations(user.id, limit, offset);

        return NextResponse.json({ conversations });
    } catch (error: any) {
        console.error('Error in GET /api/chat/conversations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/chat/conversations
 * Create a new conversation
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const conversation = await createConversation(user.id, body.title);

        return NextResponse.json({ conversation }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/chat/conversations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/chat/conversations
 * Update conversation title
 * Body: { id: string, title: string }
 */
export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, title } = await req.json();
        if (!id || !title) {
            return NextResponse.json(
                { error: 'Missing id or title' },
                { status: 400 }
            );
        }

        await updateConversationTitle(id, user.id, title);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in PATCH /api/chat/conversations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/chat/conversations
 * Delete a conversation
 * Body: { id: string }
 */
export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await deleteConversation(id, user.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in DELETE /api/chat/conversations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
