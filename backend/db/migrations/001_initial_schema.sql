-- ====================================================================
-- PRIORA - Intelligent Work Orchestration Database Schema
-- Supabase PostgreSQL Migration
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop old tutorial tables if present
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS support_requests CASCADE;
DROP TABLE IF EXISTS manager_overrides CASCADE;
DROP TABLE IF EXISTS priority_recommendations CASCADE;
DROP TABLE IF EXISTS task_priority_scores CASCADE;
DROP TABLE IF EXISTS task_execution_events CASCADE;
DROP TABLE IF EXISTS task_status_history CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS daily_summaries CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. ROLES
CREATE TABLE roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
('employee', 'Employee', 'Standard individual contributor, sees prioritized execution order and tasks'),
('manager', 'Manager', 'Team lead or operations manager, sees team health, alerts, overrides, and analytics'),
('admin', 'Administrator', 'Full system access and organizational management');

-- 2. TEAMS
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    lead_id UUID,
    health_status VARCHAR(32) DEFAULT 'HEALTHY', -- HEALTHY, NEEDS_ATTENTION, CRITICAL_ATTENTION
    expected_progress NUMERIC(5,2) DEFAULT 80.00,
    actual_progress NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL REFERENCES roles(id) DEFAULT 'employee',
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    job_title VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    attention_status VARCHAR(32) DEFAULT 'HEALTHY', -- HEALTHY, NEEDS_ATTENTION, CRITICAL_ATTENTION
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Add foreign key constraint for team lead
ALTER TABLE teams ADD CONSTRAINT fk_team_lead FOREIGN KEY (lead_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    priority VARCHAR(32) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
    target_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_code VARCHAR(32),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    business_impact VARCHAR(32) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    deadline TIMESTAMPTZ NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 60,
    actual_minutes INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED, NEEDS_HELP, OVERDUE, CANCELLED
    blocked_reason TEXT,
    blocked_category VARCHAR(64),
    current_rank INTEGER DEFAULT 999,
    priority_score NUMERIC(7,2) DEFAULT 0.00,
    recommendation_reason TEXT,
    is_carried_forward BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 6. TASK DEPENDENCIES
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_task_dependency UNIQUE (task_id, depends_on_task_id),
    CONSTRAINT chk_no_self_dependency CHECK (task_id <> depends_on_task_id)
);

-- 7. TASK STATUS HISTORY
CREATE TABLE task_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    previous_status VARCHAR(32),
    new_status VARCHAR(32) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TASK EXECUTION EVENTS
CREATE TABLE task_execution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TASK PRIORITY SCORES
CREATE TABLE task_priority_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(7,2) NOT NULL,
    manager_weight NUMERIC(5,2) DEFAULT 0.00,
    deadline_weight NUMERIC(5,2) DEFAULT 0.00,
    impact_weight NUMERIC(5,2) DEFAULT 0.00,
    dependency_weight NUMERIC(5,2) DEFAULT 0.00,
    blocking_weight NUMERIC(5,2) DEFAULT 0.00,
    carryover_weight NUMERIC(5,2) DEFAULT 0.00,
    project_weight NUMERIC(5,2) DEFAULT 0.00,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRIORITY RECOMMENDATIONS
CREATE TABLE priority_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_version INTEGER DEFAULT 1,
    rank INTEGER NOT NULL,
    priority_score NUMERIC(7,2) NOT NULL,
    reason_summary TEXT NOT NULL,
    factors JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 11. MANAGER OVERRIDES
CREATE TABLE manager_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_rank INTEGER NOT NULL,
    new_rank INTEGER NOT NULL,
    reason TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. SUPPORT REQUESTS
CREATE TABLE support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(128) NOT NULL,
    details TEXT,
    status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, IN_REVIEW, RESOLVED
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- PRIORITY_DEVIATION, POTENTIAL_BLOCKER, DEADLINE_RISK, TEAM_SLOWDOWN, EMPLOYEE_NEEDS_SUPPORT, DEPENDENCY_BOTTLENECK, MANAGER_OVERRIDE
    severity VARCHAR(32) NOT NULL DEFAULT 'BLUE', -- RED, ORANGE, BLUE, GRAY
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. COMMENTS
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DAILY SUMMARIES
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_count INTEGER DEFAULT 0,
    incomplete_count INTEGER DEFAULT 0,
    carried_forward_count INTEGER DEFAULT 0,
    total_minutes_logged INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_employee_daily_summary UNIQUE (employee_id, date)
);

-- 16. ANALYTICS EVENTS
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metric_name VARCHAR(128) NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_current_rank ON tasks(current_rank);
CREATE INDEX idx_task_deps_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_deps_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_exec_events_task ON task_execution_events(task_id);
CREATE INDEX idx_exec_events_user ON task_execution_events(user_id);
CREATE INDEX idx_exec_events_created ON task_execution_events(created_at);
CREATE INDEX idx_recommendations_emp ON priority_recommendations(employee_id, is_active);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_notifications_team ON notifications(team_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Enable RLS and permissive policies for backend service access
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_execution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_priority_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon and service_role full operational access through backend
DO $$ 
DECLARE 
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS allow_all_%I ON %I', tbl, tbl);
        EXECUTE format('CREATE POLICY allow_all_%I ON %I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;
