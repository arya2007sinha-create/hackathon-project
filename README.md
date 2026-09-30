# PRIORA &mdash; Intelligent Work Orchestration

> *"Employees shouldn't have to spend mental energy deciding what to work on next, while managers shouldn't have to discover execution problems after they become critical."*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#testing)
[![Tests](https://img.shields.io/badge/tests-8%20passed-success.svg)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](#tech-stack)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933.svg)](#tech-stack)
[![Database](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E.svg)](#database-design)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-4285F4.svg)](#ai-architecture)

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Why AI?](#why-ai)
- [Key Features](#key-features)
- [The Core Orchestration Loop](#the-core-orchestration-loop)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Database Design](#database-design)
- [API Architecture](#api-architecture)
- [Authentication & RBAC](#authentication)
- [AI Architecture & Explainability](#ai-architecture)
- [Local Installation](#local-installation)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Running Frontend](#running-frontend)
- [Running Backend](#running-backend)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Vercel (Frontend)](#vercel)
  - [Render (Backend)](#render)
- [Demo Credentials](#demo-credentials)
- [3–5 Minute Hackathon Demo Flow](#demo-flow)
- [Future Enhancements](#future-enhancements)

---

## Problem Statement

Modern enterprise organizations struggle with:
1. **Fragmented Data & Hidden Dependencies**: Work is scattered across task boards, tickets, and private chats. Upstream delays remain invisible until entire releases are halted.
2. **Mental Fatigue & Misaligned Priorities**: Employees often receive 10+ assigned tasks without clear business context on which item should actually be executed first.
3. **Delayed Problem Discovery**: Managers typically discover that an employee is blocked or a team is slowing down days or weeks after the issue began.
4. **Inefficient Collaboration & Punitive Surveillance**: Legacy monitoring systems track intrusive signals (keystrokes, webcams) rather than legitimate work progress and objective dependency bottlenecks.

---

## Proposed Solution

**PRIORA** is an AI-powered Enterprise Work Orchestration Platform that automates task prioritization and surfaces early management warnings without surveillance:

- **For Employees**: Answers *"What should I work on now?"* instantly via the flagship **Next Best Action** card, ordering work by urgency, business impact, and downstream dependencies with explainable business reasoning.
- **For Management**: Answers *"Where does attention need to go?"* through an autonomous **Early Warning System**, **Team Health matrix (5 teams)**, and **Priority Adherence tracking** (detecting when work deviates from recommended paths).

---

## Why AI?

Traditional task management platforms rely solely on static lists or manual drag-and-drop. In complex organizations:
1. **Contextual Evaluation**: AI synthesizes multi-dimensional factors (approaching deadlines, critical downstream blockers, manager-designated priorities, and previous sprint roll-overs).
2. **Explainable Recommendations**: Rather than presenting an opaque score, AI articulates clear business justifications (e.g. *"Blocks 3 downstream items: API Testing, Reconciliation, Release"*).
3. **Management Intelligence Assistant**: Grounded strictly in live database telemetry, the conversational assistant answers questions like *"Why is Operations behind?"* and suggests targeted interventions.
4. **Fault-Tolerant Hybrid Architecture**: PRIORA combines a deterministic weighted scoring engine with Google Gemini AI. If the AI service is unavailable, the platform transparently falls back to rule-based prioritization with zero disruption.

---

## Key Features

### Employee Experience (`/employee/dashboard`)
- **Next Best Action (Flagship)**: Large, elegant interface highlighting the top ranked task, due date, estimated effort, and count of blocked downstream deliverables.
- **Explainable Rationale ("Why this task?")**: Concise business factors explaining ranking decisions without exposing raw chain-of-thought.
- **Today's Recommended Order**: 10 tasks dynamically ranked 1..10 without requiring manual drag-and-drop.
- **Yesterday Context**: Displays completed, incomplete, and automatically carried-forward sprint work.
- **Blocker Workflow Modal**: Employees categorize bottlenecks (waiting on person, vendor dependency, technical issue, etc.) and request support, triggering immediate management alerts.

### Management Experience (`/management/dashboard`)
- **Team Health Matrix**: Real-time evaluation across 5 teams:
  - Product Engineering: 🟢 Healthy (88%)
  - Data & AI: 🟢 Healthy (84%)
  - Operations: 🟠 Needs Attention (Expected: 82%, Actual: 68%, 14% delta)
  - Design: 🟢 Healthy (92%)
  - Customer Success: 🔴 Critical Attention (Expected: 85%, Actual: 54%)
- **Attention Center**: Categorized notifications (Priority Deviations, Blockers, Deadline Risks, Team Slowdown).
- **Priority Adherence Engine (Flagship)**: Tracks recommended vs. actual execution orders, flagging deviations when employees jump to lower-ranked tasks.
- **Early Warning System (Flagship)**: Automatically detects team slowdowns before release deadlines are missed.
- **Employee Matrix Grid**: Transparent progress %, active tasks, blocked count, priority adherence %, and attention status badges.
- **Manager Priority Override**: Enables leadership to promote any task with mandatory audit rationale logging.
- **AI Management Assistant**: Conversational assistant answering live operational questions directly from Supabase.
- **Executive Analytics**: Recharts charts tracking completion velocity, adherence trajectories, and workload distribution with time filters (Today, 7D, 30D, 90D).

---

## The Core Orchestration Loop

```
ASSIGN  ──>  UNDERSTAND  ──>  PRIORITIZE  ──>  EXECUTE
   ▲                                               │
   │                                               ▼
REPRIORITIZE <── SUPPORT <── DETECT <── OBSERVE
```

---

## Architecture

```
                      ┌──────────────────────┐
                      │      END USER        │
                      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │    VERCEL HOSTING    │
                      │ React + Vite + TS    │
                      │ Tailwind + Recharts  │
                      └──────────┬───────────┘
                                 │ HTTPS (Axios)
                                 ▼
                      ┌──────────────────────┐
                      │    RENDER HOSTING    │
                      │ Node.js + Express.js │
                      │ JWT Auth + Bcrypt    │
                      │ MVC Architecture     │
                      └─────┬──────────┬─────┘
                            │          │
        SQL Queries / REST  │          │ Structured Prompts / JSON
                            ▼          ▼
             ┌─────────────────┐    ┌─────────────────┐
             │    SUPABASE     │    │  GOOGLE GEMINI  │
             │ PostgreSQL DB   │    │ 1.5 Flash API   │
             │ RLS + Triggers  │    │ LLM Reasoning   │
             └─────────────────┘    └─────────────────┘
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, TypeScript 5.8, React Router 6, Tailwind CSS 3.4, Axios, Lucide React, Recharts |
| **Backend** | Node.js 24, Express 4.21, TypeScript, JWT (jsonwebtoken), bcryptjs, Zod, Helmet, Morgan, Rate Limiter |
| **Database** | Supabase PostgreSQL 17 (Relational schema, 17 tables, FKs, indexes, RLS) |
| **Artificial Intelligence** | Google Gemini 1.5 Flash via `@google/generative-ai` with deterministic fallback |
| **Testing** | Vitest 3.0, Supertest |
| **Deployment** | Vercel (Frontend SPA) + Render (Backend API) + Supabase (Cloud Database) |

---

## Folder Structure

```
priora-workspace/
├── backend/
│   ├── db/
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   ├── src/
│   │   ├── ai/
│   │   │   ├── aiProvider.service.ts
│   │   │   ├── priorityExplanation.service.ts
│   │   │   ├── managementInsight.service.ts
│   │   │   └── promptTemplates.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── supabase.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── employee.controller.ts
│   │   │   ├── management.controller.ts
│   │   │   └── ai.controller.ts
│   │   ├── db/
│   │   │   └── seed.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── employee.routes.ts
│   │   │   ├── management.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── priorityEngine.service.ts
│   │   │   ├── teamHealth.service.ts
│   │   │   ├── adherence.service.ts
│   │   │   └── task.service.ts
│   │   ├── tests/
│   │   │   └── api.test.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── response.ts
│   │   ├── validators/
│   │   │   ├── auth.validator.ts
│   │   │   └── task.validator.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   └── priora-icon.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── employee.api.ts
│   │   │   ├── management.api.ts
│   │   │   └── ai.api.ts
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AiAssistantDrawer.tsx
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── employee/
│   │   │   │   ├── NextBestActionCard.tsx
│   │   │   │   ├── TodayExecutionPlan.tsx
│   │   │   │   └── BlockTaskModal.tsx
│   │   │   └── management/
│   │   │       ├── TeamHealthWidget.tsx
│   │   │       ├── PriorityAdherenceWidget.tsx
│   │   │       ├── EarlyWarningWidget.tsx
│   │   │       ├── EmployeeGridWidget.tsx
│   │   │       ├── CreateTaskModal.tsx
│   │   │       └── ManagerOverrideModal.tsx
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeDashboard.tsx
│   │   │   │   └── EmployeeTasksPage.tsx
│   │   │   └── management/
│   │   │       ├── ManagementDashboard.tsx
│   │   │       ├── TeamDetail.tsx
│   │   │       ├── EmployeeDetail.tsx
│   │   │       ├── TasksManagement.tsx
│   │   │       └── Analytics.tsx
│   │   ├── store/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── DEPLOYMENT_GUIDE.md
├── ARCHITECTURE.md
├── PROJECT_OVERVIEW.md
├── DEMO_SCRIPT.md
├── AI_ARCHITECTURE.md
├── render.yaml
├── vercel.json
└── package.json
```

---

## Database Design

PRIORA utilizes a relational PostgreSQL schema deployed on Supabase consisting of 17 tables:

1. `roles`: Standard individual contributor (`employee`), team lead (`manager`), administrator (`admin`).
2. `teams`: 5 enterprise teams with expected/actual progress velocity and health indicators.
3. `users`: Credentials, team association, job title, and attention status badges.
4. `projects`: Enterprise strategic initiatives.
5. `tasks`: Complete deliverables metadata, estimates, actual logged time, priority, and rank.
6. `task_dependencies`: Directed acyclic dependency graph tracking blocking and prerequisite tasks.
7. `task_status_history`: Timestamped audit trail of status transitions.
8. `task_execution_events`: Operational event stream (start, pause, complete, blocked, deviation, override).
9. `task_priority_scores`: Deconstructed weight breakdown for every calculated task.
10. `priority_recommendations`: Ranked output with explainable factors.
11. `manager_overrides`: Audit log of manual executive rank promotions.
12. `support_requests`: Employee assistance requests triggered by blockers.
13. `notifications`: Attention Center alerts categorized by severity (RED, ORANGE, BLUE, GRAY).
14. `comments`: Collaboration thread per task.
15. `daily_summaries`: Yesterday's completed, incomplete, and carried forward counts.
16. `analytics_events`: High-frequency metric recordings for Recharts.
17. `audit_logs`: Enterprise security access logs.

---

## API Architecture

### Authentication
- `POST /api/auth/login`: Authenticates with bcrypt, returns JWT. Never exposes `password_hash`.
- `POST /api/auth/logout`: Clears session.
- `GET /api/auth/me`: Returns profile and team membership.

### Employee
- `GET /api/employee/dashboard`: Returns Next Best Action, today's ranked plan, progress, and yesterday's summary.
- `GET /api/employee/tasks`: Filterable list of assigned tasks.
- `GET /api/employee/tasks/:id`: Task details with dependencies.
- `PATCH /api/employee/tasks/:id/status`: Updates state (NOT_STARTED, IN_PROGRESS, COMPLETED, PAUSED).
- `POST /api/employee/tasks/:id/block`: Sets task to BLOCKED, employee to ORANGE, creates manager alert.
- `POST /api/employee/tasks/:id/help`: Submits support request to management.
- `POST /api/employee/tasks/:id/suggest-priority`: Triggers dynamic reprioritization.

### Management
- `GET /api/management/dashboard`: Team health, attention center, adherence alerts, early warning, employee matrix.
- `GET /api/management/teams`: Overview of all 5 teams.
- `GET /api/management/teams/:id`: Drill-down into team lead, members, projects, and risk signals.
- `GET /api/management/employees`: Employee list with role and team.
- `GET /api/management/employees/:id`: Deep dive into employee task history and adherence %.
- `GET /api/management/tasks`: Search and filter tasks across the enterprise.
- `POST /api/management/tasks`: Creates a new task and triggers automatic priority recalculation.
- `POST /api/management/tasks/:id/override`: Applies manual ranking override with audit justification.
- `GET /api/management/alerts`: Notifications feed.
- `GET /api/management/analytics`: Time-series analytics for Recharts (Today, 7D, 30D, 90D).

### AI
- `POST /api/ai/prioritize`: Runs contextual prioritization.
- `POST /api/ai/explain`: Returns explainable business factors for Next Best Action.
- `POST /api/ai/insights`: Management AI Assistant answering queries grounded in live database data.

### Health
- `GET /health`: Returns `{ "status": "ok", "service": "PRIORA Enterprise Work Orchestration API" }`.

---

## Authentication

Authentication is implemented with **JSON Web Tokens (JWT)** and **bcrypt** password hashing:
- Passwords hashed with salt factor 10.
- JWT tokens signed with `JWT_SECRET` and validated via `authenticateJwt` middleware.
- Role-based authorization enforced via `requireRoles(['manager', 'admin'])`.
- Employees cannot access management routes; non-authenticated requests are rejected with 401.

---

## AI Architecture

The AI module in `/backend/src/ai` integrates with Google Gemini 1.5 Flash:
1. `aiProvider.service.ts`: Client provider abstraction.
2. `priorityExplanation.service.ts`: Generates concise business reasoning for the Next Best Action without exposing chain-of-thought.
3. `managementInsight.service.ts`: Synthesizes live database context to answer executive operations questions.
4. `promptTemplates.ts`: Enforces strict structured JSON schema output and prevents hallucinations.
5. **Deterministic Fallback**: If `GEMINI_API_KEY` is absent or the API encounters rate-limits, the platform automatically falls back to rule-based prioritization and insight generation with zero downtime.

---

## Local Installation

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### 1. Clone Repository
```bash
git clone https://github.com/your-username/priora.git
cd priora
```

### 2. Install Dependencies
```bash
# Root & Backend
npm --prefix backend install

# Frontend
npm --prefix frontend install
```

---

## Supabase Setup

The repository is configured to connect to Supabase PostgreSQL. If configuring a new instance:
1. Run the database migration script in Supabase SQL Editor:
   ```bash
   backend/db/migrations/001_initial_schema.sql
   ```
2. Populate the Northstar Technologies demo dataset (100+ tasks, 5 teams, 11 users):
   ```bash
   npm --prefix backend run seed
   ```

---

## Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://qmfetvrsqzseacdoscsb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZmV0dnJzcXpzZWFjZG9zY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODUwNzMsImV4cCI6MjEwNjE2MTA3M30.2cUpsX9Zi13nohBlrIBCFligwFet2lNI7Zi-0UzSt0U
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=priora-enterprise-jwt-super-secret-key-2026-production
JWT_REFRESH_SECRET=priora-refresh-jwt-secret-key-2026-production
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=your-optional-gemini-key
CORS_ORIGIN=*
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Running Backend

```bash
cd backend
npm run dev
```
The server will start at `http://localhost:5000`. Health check available at `http://localhost:5000/health`.

---

## Running Frontend

```bash
cd frontend
npm run dev
```
The client application will open at `http://localhost:5173`.

---

## Testing

Run the automated integration test suite:
```bash
npm --prefix backend test
```
All 8 integration test scenarios execute against the live database:
- Health check
- Bcrypt credential verification & JWT issuance
- Manager role-based authorization
- Invalid credential rejection
- Flagship Next Best Action calculation
- Access boundary enforcement
- Management dashboard telemetry & Operations alert
- AI insight generation with live database grounding

---

## Deployment

### Vercel (Frontend)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend` (or use root with `vercel.json`).
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Configure Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com/api`
6. Deploy.

### Render (Backend)
1. Create a new Web Service on [Render](https://render.com) using the GitHub repository.
2. Set Root Directory: `backend`
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm start`
5. Configure Environment Variables:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: `https://your-supabase-id.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-supabase-anon-key`
   - `JWT_SECRET`: `your-secure-random-secret`
   - `GEMINI_API_KEY`: `your-google-gemini-key`
   - `CORS_ORIGIN`: `https://your-vercel-frontend.vercel.app`
6. Deploy.

---

## Demo Credentials

| Role | Name | Email | Password | Persona Overview |
|---|---|---|---|---|
| **Employee** | Rahul Sharma | `rahul.sharma@northstar.io` | `Employee123!` | Senior Integration Engineer, Operations Team |
| **Manager** | Sarah Chen | `sarah.chen@northstar.io` | `Manager123!` | VP of Engineering & Operations Lead |
| **Admin** | Evelyn Carter | `admin@northstar.io` | `Admin123!` | Chief Technology Officer |
| **Employee** | Aman Verma | `aman.verma@northstar.io` | `Employee123!` | ML Platform Engineer (Priority Deviation demo) |
| **Employee** | Priya Patel | `priya.patel@northstar.io` | `Employee123!` | Staff Software Engineer, Product Engineering |

*Tip: You can also use the 1-click **Live Demo Persona Switcher** in the top navigation bar to switch personas instantly without typing credentials.*

---

## Demo Flow (3–5 Minute Hackathon Pitch)

1. **Open Application**: Navigate to the login screen and click **Sarah Chen (Manager)**.
2. **Operations Overview**: Point to the **Team Health** widget showing 5 teams: Operations is highlighted in 🟠 *Needs Attention*.
3. **Drill Down into Operations**: Click Operations to reveal the 14% progress delta, 3 delayed tasks, and 1 blocked employee.
4. **Inspect Bottlenecks**: Show that *Resolve Payment API Integration* is blocking 3 critical downstream tasks.
5. **Switch to Employee**: In the top navigation, click **Switch Role: Rahul (Employee)**.
6. **Flagship Next Best Action**: Show that among Rahul's 10 tasks, Task #6 was automatically promoted to **Rank #1** as the Next Best Action because it is critical, due today, and blocks 3 tasks.
7. **Explainable Rationale**: Click **View reasoning** to show the 4 business impact factors.
8. **Start Task**: Click **START TASK** (triggers telemetry event).
9. **Simulate Blocker**: Click **Mark Blocked**, select *External dependency*, enter vendor sandbox notes, and click **Request Support**.
10. **Immediate Status Propagation**: Rahul's status turns to 🟠 *Needs Attention*.
11. **Switch Back to Manager**: Switch to **Sarah Chen**; demonstrate the new orange support alert in the **Attention Center**.
12. **AI Management Assistant**: Open the AI Assistant drawer, click *"Why is Operations behind?"*, and show the answer generated strictly from live database data.
13. **Manager Override**: Demonstrate promoting an urgent customer escalation to Rank #1 with audit logging.
14. **Conclude**: Summarize the core loop: **Plan → Prioritize → Execute → Detect → Support → Reprioritize**.

---

## Future Enhancements
- Slack / Microsoft Teams webhook dispatch for critical blocker escalations.
- Historical sprint retrospectives comparing estimated vs actual effort trends.
- Real-time WebSocket subscriptions via Supabase Realtime channels.
- Multi-tenant enterprise organization partitioning.
