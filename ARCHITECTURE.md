# PRIORA &mdash; Technical Architecture & System Design

## 1. Executive Summary

PRIORA is an enterprise work orchestration platform engineered to solve two fundamental problems in modern knowledge organizations:
1. **The Individual Contributor Dilemma**: Information fragmentation makes it cognitively exhausting for employees to determine what task should actually be executed next.
2. **The Executive Visibility Lag**: Operational problems (bottlenecks, priority deviations, team slowdowns) are typically discovered weeks after they become critical.

PRIORA bridges this gap by combining **deterministic weighted business algorithms** with **generative AI contextual synthesis**, operating across a secure three-tier cloud topology.

---

## 2. High-Level System Architecture

```
┌────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                   │
│                                                        │
│  React 18 + Vite 6 Single Page Application             │
│  Tailwind CSS Design System (Quiet Luxury Enterprise)  │
│  Recharts Analytics Engine                             │
│  Hosted on Vercel Edge Network                         │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS (REST / JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│                     APPLICATION TIER                   │
│                                                        │
│  Node.js 24 + Express 4.21 MVC Architecture            │
│  JWT Authentication & Role-Based Access Control (RBAC) │
│  Zod Schema Validation Middleware                      │
│  Helmet + CORS + IP Rate Limiting                      │
│  Hosted on Render Cloud Infrastructure                 │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            │ PostgreSQL Driver / PostgREST  │ HTTPS Structured JSON
            ▼                                ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│        DATA TIER         │   │      AI ENGINE TIER     │
│                          │   │                         │
│ Supabase PostgreSQL 17   │   │ Google Gemini 1.5 Flash │
│ 17 Relational Tables     │   │ Multi-factor Prompts    │
│ High-performance Indexes │   │ Deterministic Fallback  │
│ Directed Dependency DAG  │   │ Zero Chain-of-Thought   │
└──────────────────────────┘   └─────────────────────────┘
```

---

## 3. Data Flow & Request Lifecycle

```
CLIENT REQUEST
   │
   ▼
[1] CORS & Helmet Security Middlewares
   │
   ▼
[2] Rate Limiter Middleware (500 req/15min)
   │
   ▼
[3] JWT Authentication Middleware (Bearer token verification)
   │
   ▼
[4] RBAC Authorization Middleware (Employee vs Manager/Admin role gate)
   │
   ▼
[5] Zod Schema Validation Middleware (Validates payload structure)
   │
   ▼
[6] Controller Layer (Orchestrates domain requests)
   │
   ▼
[7] Service Layer (Priority Engine, Team Health, Adherence, Task Manager)
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
[8A] Supabase PostgreSQL       [8B] Gemini AI Provider        [8C] Fallback Engine
(Relational queries)          (Contextual summaries)         (Deterministic scoring)
   │                              │                              │
   └──────────────────────────────┴──────────────────────────────┘
   │
   ▼
[9] Standardized API JSON Response Envelope:
    {
      "success": true,
      "data": { ... },
      "message": "Operation successful"
    }
```

---

## 4. Priority Scoring Algorithm Specification

The core prioritization engine (`priorityEngine.service.ts`) calculates an objective numerical priority score for every task assigned to an employee:

$$\text{Priority Score} = W_{\text{mgr}} + W_{\text{deadline}} + W_{\text{impact}} + W_{\text{blocking}} + W_{\text{dep}} + W_{\text{carry}} + W_{\text{proj}}$$

### Weight Breakdown
1. **Manager Priority ($W_{\text{mgr}}$ &mdash; Max 30 points)**:
   - `CRITICAL`: 30 pts
   - `HIGH`: 22 pts
   - `MEDIUM`: 15 pts
   - `LOW`: 8 pts
2. **Deadline Urgency ($W_{\text{deadline}}$ &mdash; Max 25 points)**:
   - Overdue or due within 12 hours: 24&ndash;25 pts
   - Due within 24 hours: 20 pts
   - Due within 72 hours: 14 pts
   - Due > 72 hours: 8 pts
3. **Business Impact ($W_{\text{impact}}$ &mdash; Max 20 points)**:
   - `CRITICAL`: 20 pts
   - `HIGH`: 15 pts
   - `MEDIUM`: 10 pts
   - `LOW`: 5 pts
4. **Blocking Downstream Impact ($W_{\text{blocking}}$ &mdash; Max 15 points)**:
   - $\min(\text{Downstream Tasks Blocked} \times 5, 15)$
   - Tasks blocking 3+ items receive maximum boost.
5. **Dependency Impact ($W_{\text{dep}}$)**:
   - $-15\text{ pts}$ if waiting on an unresolved upstream dependency.
   - $+5\text{ pts}$ if all dependencies are resolved.
6. **Carry-over Impact ($W_{\text{carry}}$ &mdash; Max 5 points)**:
   - $+5\text{ pts}$ if uncompleted from yesterday's sprint.
7. **Project Importance ($W_{\text{proj}}$ &mdash; Max 5 points)**:
   - Strategic tier-1 project alignment.

---

## 5. Security & Privacy Philosophy

1. **Anti-Surveillance Guarantee**: PRIORA specifically rejects keystroke tracking, screen scraping, webcam monitoring, and employee productivity shaming. All telemetry is derived strictly from task statuses, deadlines, and dependency graphs.
2. **Zero Plaintext Credentials**: All passwords hashed using bcrypt (cost factor 10). Passwords hashes are filtered out of all API responses.
3. **AI Secret Isolation**: The `GEMINI_API_KEY` exists exclusively in backend environment variables and is never transmitted to client browsers.
4. **No Opaque LLM Dependence**: The application retains full operational capability even if external AI APIs are unreachable.
