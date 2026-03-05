import { supabaseAdmin } from './supabase';

export interface ChatConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

/**
 * Get all conversations for a user, ordered by most recently updated
 */
export async function getUserConversations(
    userId: string,
    limit = 50,
    offset = 0
): Promise<ChatConversation[]> {
    const { data, error } = await supabaseAdmin
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get a single conversation with its messages
 */
export async function getConversationWithMessages(
    conversationId: string,
    userId: string
): Promise<{ conversation: ChatConversation; messages: ChatMessage[] } | null> {
    // Fetch conversation
    const { data: conversation, error: convError } = await supabaseAdmin
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

    if (convError || !conversation) {
        return null;
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabaseAdmin
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (msgError) {
        console.error('Error fetching messages:', msgError);
        throw msgError;
    }

    return {
        conversation,
        messages: messages || [],
    };
}

/**
 * Create a new conversation
 */
export async function createConversation(
    userId: string,
    title?: string
): Promise<ChatConversation> {
    const { data, error } = await supabaseAdmin
        .from('chat_conversations')
        .insert({
            user_id: userId,
            title: title || 'Cuộc trò chuyện mới',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }

    return data;
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
): Promise<ChatMessage> {
    const { data, error } = await supabaseAdmin
        .from('chat_messages')
        .insert({
            conversation_id: conversationId,
            role,
            content,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding message:', error);
        throw error;
    }

    return data;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string
): Promise<void> {
    const { error } = await supabaseAdmin
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating conversation title:', error);
        throw error;
    }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(
    conversationId: string,
    userId: string
): Promise<void> {
    const { error } = await supabaseAdmin
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting conversation:', error);
        throw error;
    }
}
