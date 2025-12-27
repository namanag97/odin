# 🧬 ERD Extraction & Ontological Integration Guide

## The Core Problem

You have:
- ✅ A solid **SaaS foundation** (multi-tenancy, auth, billing, etc.)
- ✅ **Competitor documentation** showing features/flows
- ✅ A **library/framework** you'll use
- ❓ Need to extract a **domain model** and integrate it cleanly

This guide provides a **systematic methodology** to do this properly.

---

## 🔄 The Four-Phase Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   EXTRACT   │ ──▶ │    MODEL    │ ──▶ │  INTEGRATE  │ ──▶ │  VALIDATE   │
│             │     │             │     │             │     │             │
│ • Nouns     │     │ • Classify  │     │ • Bind to   │     │ • Check     │
│ • Verbs     │     │ • Normalize │     │   Tenant    │     │   layers    │
│ • Attrs     │     │ • Type map  │     │ • Connect   │     │ • Test      │
│             │     │             │     │   Identity  │     │   queries   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## Phase 1: EXTRACT — Document Analysis

### 1.1 Source Categorization

| Source Type | What It Reveals | Priority |
|-------------|-----------------|----------|
| **API Docs** | Data structures, fields, types | 🔴 Critical |
| **UI Screenshots** | User-facing entities, workflows | 🔴 Critical |
| **Help/Support** | Business rules, edge cases | 🟡 High |
| **Database schemas** | Direct structure (if available) | 🔴 Critical |
| **Marketing pages** | Core value entities | 🟢 Medium |
| **Pricing pages** | Metered/limited resources | 🟡 High |

### 1.2 Entity Extraction (Noun Mining)

**Technique:** Read through docs highlighting every significant **NOUN**.

```
From: "Users can create Projects. Each Project contains multiple Tasks. 
       Tasks can be assigned to Team members and have due dates."

Extracted Nouns:
├── User ✅ (already in Identity layer)
├── Project ✅ NEW DOMAIN ENTITY
├── Task ✅ NEW DOMAIN ENTITY  
├── Team ✅ (already in Identity layer)
├── member → TeamMembership ✅ (already exists)
└── due date → attribute of Task
```

**Noun Qualification Matrix:**

| Noun | Has ID? | Has Status? | CRUD Operations? | Entity? |
|------|---------|-------------|------------------|---------|
| Project | Yes | Yes (active/archived) | Create, Edit, Delete | ✅ YES |
| Task | Yes | Yes (todo/done) | Create, Edit, Delete | ✅ YES |
| Dashboard | No | No | View only | ❌ NO (UI concept) |
| Notification | Maybe | Yes | Create, Read | ⚠️ EXISTS in Communication layer |
| Report | Maybe | No | Generate, View | ⚠️ MAYBE (or just a query?) |

### 1.3 Relationship Extraction (Verb Mining)

**Technique:** Find **VERBS** connecting nouns.

```
"Project contains Tasks"          → Project 1:N Task
"User creates Project"            → Project.created_by → User
"Task assigned to User"           → Task.assignee_id → User
"Project belongs to Workspace"    → Project.workspace_id → Workspace
"Users collaborate on Project"    → ProjectMember (N:M junction)
```

**Cardinality Clue Words:**

| Word/Phrase | Likely Cardinality |
|-------------|-------------------|
| "a", "the", "one" | 1:1 or N:1 |
| "contains", "has many" | 1:N |
| "multiple", "list of" | 1:N |
| "shared between", "collaborate" | N:M |
| "optionally has" | 0..1 |

### 1.4 Attribute Extraction

**Sources to mine:**

1. **Form fields** → Required vs optional attributes
2. **API payloads** → Types and structures
3. **Filter options** → Indexed/queryable fields
4. **Table columns** → Display attributes
5. **Settings panels** → Configuration attributes

**Example extraction from a Project creation form:**

```
┌─────────────────────────────────────────┐
│ Create Project                          │
├─────────────────────────────────────────┤
│ Name: [________________] *              │  → name VARCHAR(255) NOT NULL
│ Description: [__________]               │  → description TEXT NULL
│ Status: [Draft ▼]                       │  → status ENUM('draft','active'...)
│ Due Date: [📅 Pick date]                │  → due_date DATE NULL
│ Workspace: [Engineering ▼] *            │  → workspace_id UUID NOT NULL FK
│ Template: [Blank ▼]                     │  → created_from_template_id UUID NULL
│ [x] Private project                     │  → is_private BOOLEAN DEFAULT false
│                                         │
│ [Cancel] [Create Project]               │
└─────────────────────────────────────────┘
```

---

## Phase 2: MODEL — Domain Structuring

### 2.1 Entity Classification

Classify each discovered entity:

| Type | Description | Integration Strategy |
|------|-------------|---------------------|
| **Core** | Primary business objects | Full lifecycle, audit, history |
| **Supporting** | Enables core entities | Lighter tracking |
| **Transactional** | Events/logs | Append-only, time-based |
| **Reference** | Lookup data | Possibly tenant-shared |
| **Junction** | M:N relationships | Composite keys |

**Example Classification:**

```
Core Entities:
├── Project (central to the domain)
├── Task (primary work unit)
└── Workspace (organizational boundary)

Supporting Entities:
├── Tag (categorization)
├── Label (visual indicator)
└── TaskType (configuration)

Transactional Entities:
├── Comment (append-only)
├── Activity (event log)
└── TimeEntry (work log)

Reference Entities:
├── Priority (low/medium/high)
├── TaskStatus (predefined statuses)
└── ProjectTemplate

Junction Entities:
├── ProjectMember (User ↔ Project)
├── TaskAssignee (User ↔ Task, if multiple)
└── TaskTag (Task ↔ Tag)
```

### 2.2 Normalization

Apply 3NF while documenting intentional denormalizations:

```sql
-- ❌ BEFORE: Denormalized
CREATE TABLE task (
  id UUID,
  project_id UUID,
  project_name VARCHAR(255),  -- ❌ Duplicated from project
  assignee_id UUID,
  assignee_name VARCHAR(255), -- ❌ Duplicated from user
  assignee_email VARCHAR(320) -- ❌ Duplicated from user
);

-- ✅ AFTER: Normalized
CREATE TABLE task (
  id UUID,
  project_id UUID REFERENCES project(id),
  assignee_id UUID REFERENCES "user"(id)
  -- Join to get names
);

-- ⚠️ INTENTIONAL DENORMALIZATION (documented)
CREATE TABLE activity_log (
  id UUID,
  actor_id UUID,
  actor_name VARCHAR(255),  -- Denormalized: preserved for history
  actor_email VARCHAR(320), -- Denormalized: user might be deleted
  -- Rationale: Historical accuracy even if user changes name/is deleted
);
```

### 2.3 Standard Column Patterns

Apply consistent patterns across all domain entities:

```sql
-- Base columns for all domain entities
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id UUID NOT NULL REFERENCES tenant(id),

-- Temporal tracking
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at TIMESTAMPTZ, -- Soft delete

-- Ownership
created_by UUID NOT NULL REFERENCES "user"(id),
updated_by UUID REFERENCES "user"(id),

-- Extensibility
metadata JSONB DEFAULT '{}',

-- Indexing
-- Always index: tenant_id, created_at, status fields
```

---

## Phase 3: INTEGRATE — Ontological Connection

### 3.1 Layer Connection Map

```
YOUR DOMAIN ENTITIES
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    EXISTENCE LAYER                         │
│  tenant_id UUID REFERENCES tenant(id) ← EVERY ENTITY      │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    IDENTITY LAYER                          │
│  created_by, updated_by, owned_by, assigned_to → user(id) │
│  organization_id, team_id → org/team scoping              │
│  + Permission entries for RBAC                            │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                   COMMERCIAL LAYER                         │
│  PlanLimit: project_count, task_count, storage_mb         │
│  PlanFeature: gantt_view, time_tracking, custom_fields    │
│  UsageRecord: track consumption for metering              │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    TEMPORAL LAYER                          │
│  AuditLog: all CRUD operations logged                     │
│  EntityHistory: version tracking for key entities         │
│  ScheduledJob: recurring domain tasks                     │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                  INTEGRATION LAYER                         │
│  Webhook events: project.created, task.completed          │
│  API scopes: projects:read, tasks:write                   │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                 COMMUNICATION LAYER                        │
│  NotificationTemplate: task_assigned, project_deadline    │
│  Trigger notifications from domain events                 │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Integration SQL Templates

**Existence Layer Binding:**
```sql
CREATE TABLE project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  -- ... domain fields
  
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenant(id) ON DELETE CASCADE
);

-- Row-Level Security (RLS) for tenant isolation
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON project
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**Identity Layer Binding:**
```sql
-- Ownership columns
created_by UUID NOT NULL REFERENCES "user"(id),
updated_by UUID REFERENCES "user"(id),
owned_by UUID REFERENCES "user"(id), -- Primary owner

-- Scoping (if applicable)
organization_id UUID REFERENCES organization(id),
team_id UUID REFERENCES team(id),

-- Permission registration
INSERT INTO permission (resource, action, description, category) VALUES
  ('project', 'create', 'Create new projects', 'projects'),
  ('project', 'read', 'View project details', 'projects'),
  ('project', 'update', 'Edit project settings', 'projects'),
  ('project', 'delete', 'Delete projects', 'projects'),
  ('project', 'manage_members', 'Add/remove project members', 'projects'),
  ('task', 'create', 'Create tasks in projects', 'tasks'),
  ('task', 'assign', 'Assign tasks to users', 'tasks');
```

**Commercial Layer Hooks:**
```sql
-- Define limits per plan
INSERT INTO plan_limit (plan_id, resource_type, limit_value, limit_type) VALUES
  -- Starter Plan
  ((SELECT id FROM plan WHERE slug = 'starter'), 'project', 5, 'hard'),
  ((SELECT id FROM plan WHERE slug = 'starter'), 'task_per_project', 100, 'hard'),
  ((SELECT id FROM plan WHERE slug = 'starter'), 'storage_mb', 500, 'hard'),
  -- Professional Plan  
  ((SELECT id FROM plan WHERE slug = 'professional'), 'project', 50, 'hard'),
  ((SELECT id FROM plan WHERE slug = 'professional'), 'task_per_project', 1000, 'soft'),
  ((SELECT id FROM plan WHERE slug = 'professional'), 'storage_mb', 10000, 'soft');

-- Define feature flags per plan
INSERT INTO plan_feature (plan_id, feature_key, is_enabled) VALUES
  ((SELECT id FROM plan WHERE slug = 'starter'), 'project.gantt_view', false),
  ((SELECT id FROM plan WHERE slug = 'starter'), 'project.custom_fields', false),
  ((SELECT id FROM plan WHERE slug = 'professional'), 'project.gantt_view', true),
  ((SELECT id FROM plan WHERE slug = 'professional'), 'project.custom_fields', true),
  ((SELECT id FROM plan WHERE slug = 'professional'), 'project.time_tracking', true);
```

**Temporal Layer Integration:**
```sql
-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    tenant_id, actor_type, actor_id, action,
    resource_type, resource_id, changes, created_at
  ) VALUES (
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    'user',
    current_setting('app.user_id', true)::UUID,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
      'new', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END
    ),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to domain tables
CREATE TRIGGER audit_project
  AFTER INSERT OR UPDATE OR DELETE ON project
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_task
  AFTER INSERT OR UPDATE OR DELETE ON task
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
```

---

## Phase 4: VALIDATE — Quality Assurance

### 4.1 Ontological Consistency Checklist

```
✅ VALID Dependencies:
   Domain → Identity (project.created_by → user)
   Domain → Existence (project.tenant_id → tenant)
   Domain → Domain (task.project_id → project)

❌ INVALID Dependencies:
   Identity → Domain (user.current_project_id → project) ← WRONG DIRECTION
   Commercial → Domain (invoice.project_id → project) ← COUPLING VIOLATION
   Existence → Domain (tenant.default_project_id → project) ← WRONG DIRECTION
```

### 4.2 Query Validation

Test these patterns work efficiently:

```sql
-- 1. Tenant isolation (MUST be indexed)
EXPLAIN ANALYZE
SELECT * FROM project WHERE tenant_id = 'uuid';

-- 2. User's projects (common query)
EXPLAIN ANALYZE
SELECT p.* FROM project p
JOIN project_member pm ON pm.project_id = p.id
WHERE pm.user_id = 'uuid' AND p.tenant_id = 'uuid';

-- 3. Task listing with filters
EXPLAIN ANALYZE
SELECT * FROM task 
WHERE project_id = 'uuid' 
  AND status = 'in_progress'
  AND due_date < now() + interval '7 days';
```

### 4.3 Final Integration Checklist

```
□ All domain entities have tenant_id
□ All domain entities have created_by, created_at, updated_at
□ All domain entities have soft delete (deleted_at)
□ Permissions registered for each entity × action
□ Plan limits defined for countable resources
□ Feature flags defined for gated features
□ Audit triggers attached to key entities
□ Webhook event types registered
□ Notification templates created for key events
□ API scopes defined
□ Indexes created for common query patterns
□ RLS policies enabled for tenant isolation
```

---

## 🎯 Quick Decision Framework

When unsure about a design decision, ask:

1. **"Which layer owns this?"** → Place it there
2. **"Who needs to access this?"** → Design permissions accordingly
3. **"Will this change over time?"** → Add history tracking
4. **"Is this metered/limited?"** → Add to PlanLimit
5. **"Should external systems know?"** → Add webhook event
6. **"Will users want notifications?"** → Create template

---

## Next Steps

1. **Share your domain** → I'll help extract entities
2. **Share competitor docs** → I'll help analyze
3. **Share library docs** → I'll help align the model
4. **Start building** → I'll generate migration SQL

Ready when you are! 🚀
