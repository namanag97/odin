-- ============================================================================
-- PHASE 13: AI/COPILOT LAYER (LangChain/RAG Compatible)
-- Purpose: Tables for AI assistant, conversation memory, and embeddings
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: copilot_sessions
-- Purpose: Conversation sessions for Process Copilot (LangChain memory)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copilot_sessions (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,  -- Reference to future users table
    
    -- Context binding
    event_log_id TEXT,      -- Optional: scope to specific event log
    data_pool_id TEXT,      -- Optional: scope to specific data pool
    
    -- LangChain memory configuration
    memory_type TEXT DEFAULT 'buffer' CHECK (memory_type IN ('buffer', 'summary', 'buffer_window', 'entity')),
    max_tokens INTEGER DEFAULT 4000,
    window_size INTEGER DEFAULT 10,  -- For buffer_window memory
    
    -- Session metadata
    title TEXT,             -- User-provided or auto-generated title
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_message_at TEXT,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_log_id) REFERENCES event_logs(id) ON DELETE SET NULL,
    FOREIGN KEY (data_pool_id) REFERENCES data_pools(id) ON DELETE SET NULL
);

CREATE INDEX idx_copilot_sessions_tenant ON copilot_sessions(tenant_id, user_id, status);
CREATE INDEX idx_copilot_sessions_updated ON copilot_sessions(tenant_id, updated_at DESC);

-- -----------------------------------------------------------------------------
-- Table: copilot_messages
-- Purpose: Individual messages in a conversation (LangChain ChatMessageHistory)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copilot_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- LangChain message types
    role TEXT NOT NULL CHECK (role IN ('human', 'ai', 'system', 'function', 'tool')),
    content TEXT NOT NULL,
    
    -- Ordering
    sequence INTEGER NOT NULL,
    
    -- LangChain additional_kwargs
    metadata TEXT DEFAULT '{}',  -- JSON: function_call, tool_use, citations, etc.
    
    -- Token tracking
    token_count INTEGER,
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (session_id) REFERENCES copilot_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_copilot_messages_session ON copilot_messages(session_id, sequence);
CREATE INDEX idx_copilot_messages_role ON copilot_messages(session_id, role);

-- -----------------------------------------------------------------------------
-- Table: copilot_tool_calls
-- Purpose: Track AI tool/function calls for debugging and analytics
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copilot_tool_calls (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,  -- The AI message that initiated the call
    session_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    
    -- Tool/Function details
    tool_name TEXT NOT NULL,
    tool_input TEXT NOT NULL,  -- JSON: function arguments
    tool_output TEXT,          -- JSON: function return value
    
    -- Execution tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error')),
    error_message TEXT,
    execution_time_ms INTEGER,
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    
    FOREIGN KEY (message_id) REFERENCES copilot_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES copilot_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_copilot_tool_calls_message ON copilot_tool_calls(message_id);
CREATE INDEX idx_copilot_tool_calls_status ON copilot_tool_calls(session_id, status);

-- -----------------------------------------------------------------------------
-- Table: copilot_embeddings
-- Purpose: Vector embeddings for RAG (Retrieval Augmented Generation)
-- Note: SQLite doesn't support native vectors. Store as BLOB (serialized float array)
--       For production, migrate to PostgreSQL with pgvector
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copilot_embeddings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    
    -- Source document reference
    source_type TEXT NOT NULL CHECK (source_type IN (
        'activity', 'kpi', 'variant', 'resource', 'documentation',
        'discovered_model', 'conformance_result', 'bottleneck'
    )),
    source_id TEXT NOT NULL,
    
    -- Content that was embedded
    content TEXT NOT NULL,
    chunk_index INTEGER DEFAULT 0,  -- For long documents split into chunks
    
    -- Embedding storage (SQLite: serialized, Postgres: vector(1536))
    embedding BLOB,  -- Serialized float32 array
    embedding_model TEXT DEFAULT 'text-embedding-ada-002',
    embedding_dimensions INTEGER DEFAULT 1536,
    
    -- Metadata for filtering
    metadata TEXT DEFAULT '{}',  -- JSON: additional context
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (source_type, source_id, chunk_index)
);

CREATE INDEX idx_copilot_embeddings_source ON copilot_embeddings(source_type, source_id);
CREATE INDEX idx_copilot_embeddings_tenant ON copilot_embeddings(tenant_id, source_type);

-- -----------------------------------------------------------------------------
-- Table: copilot_knowledge_base
-- Purpose: Custom documentation and knowledge articles for RAG
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copilot_knowledge_base (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    
    -- Document metadata
    title TEXT NOT NULL,
    category TEXT,  -- 'process', 'compliance', 'glossary', 'sop'
    
    -- Content
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'text', 'html')),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    
    -- Status
    is_active INTEGER DEFAULT 1,
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_copilot_knowledge_tenant ON copilot_knowledge_base(tenant_id, category, is_active);

-- -----------------------------------------------------------------------------
-- Table: copilot_feedback
-- Purpose: User feedback on AI responses for RLHF/improvement
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS copilot_feedback (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Feedback type
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_type TEXT CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'correction', 'report')),
    
    -- Detailed feedback
    comment TEXT,
    correction TEXT,  -- User's corrected response
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (message_id) REFERENCES copilot_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES copilot_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_copilot_feedback_message ON copilot_feedback(message_id);
CREATE INDEX idx_copilot_feedback_type ON copilot_feedback(tenant_id, feedback_type);
