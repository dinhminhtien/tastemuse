-- ============================================================
-- TasteMuse – Conversation State Persistence
-- Run in Supabase SQL Editor
-- ============================================================

-- ************************************************************
-- 1. CONVERSATION SESSIONS
-- ************************************************************
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,  -- For anonymous users (cookie/local storage ID)
    title TEXT,  -- Auto-generated from first message
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE conversation_sessions IS 'Chat conversation sessions for multi-turn memory';

-- ************************************************************
-- 2. CONVERSATION MESSAGES
-- ************************************************************
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,  -- Stores: matched_docs, filters, similarity scores
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE conversation_messages IS 'Individual messages within a conversation session';

-- ************************************************************
-- 3. INDEXES
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_conv_sessions_user ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_sessions_session ON conversation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_sessions_active ON conversation_sessions(is_active, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_messages_session ON conversation_messages(session_id, created_at ASC);

-- ************************************************************
-- 4. AUTO-UPDATE updated_at
-- ************************************************************
CREATE TRIGGER trg_conv_sessions_updated_at
    BEFORE UPDATE ON conversation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ************************************************************
-- 5. RLS
-- ************************************************************
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
    ON conversation_sessions FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own messages"
    ON conversation_messages FOR ALL
    USING (
        session_id IN (
            SELECT id FROM conversation_sessions
            WHERE user_id = auth.uid() OR user_id IS NULL
        )
    );

SELECT 'Conversation sessions tables created successfully' AS status;
