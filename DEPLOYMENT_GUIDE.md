# PRIORA &mdash; Production Deployment Guide

This document outlines the step-by-step procedure to deploy the PRIORA Enterprise Work Orchestration Platform across **Supabase** (PostgreSQL), **Render** (Express API), and **Vercel** (React Frontend SPA).

```
   ┌───────────────────────┐
   │     USER BROWSER      │
   └───────────┬───────────┘
               │
               ▼
   ┌───────────────────────┐
   │        VERCEL         │   Production React.js Frontend
   │ (Single Page App SPA) │   https://priora.vercel.app
   └───────────┬───────────┘
               │ HTTPS API Requests
               ▼
   ┌───────────────────────┐
   │        RENDER         │   Production Node.js + Express API
   │   (Web Service API)   │   https://priora-backend.onrender.com
   └─────┬───────────┬─────┘
         │           │
         │           ▼
         │   ┌───────────────┐
         │   │ GOOGLE GEMINI │   Contextual prioritization &
         │   │   1.5 FLASH   │   management chat assistant
         │   └───────────────┘
         ▼
┌──────────────────┐
│     SUPABASE     │   Main Persistent PostgreSQL 17
│ (Cloud Database) │   17 Relational Tables + RLS Policies
└──────────────────┘
```

---

## 1. Supabase PostgreSQL Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new project (e.g. `priora-db`). Note your database password.
3. Open the **SQL Editor** in the Supabase navigation menu.
4. Copy and paste the contents of `backend/db/migrations/001_initial_schema.sql` into the editor and click **Run**.
   - This sets up all 17 relational tables, foreign key constraints, indexes, and permissive backend policies.
5. In **Project Settings** &rarr; **API**, copy:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / public key**
6. Seed the Northstar Technologies enterprise dataset (100+ tasks, 5 teams, 11 demo users):
   ```bash
   npm --prefix backend run seed
   ```

---

## 2. Render Backend API Deployment

1. Sign up or log into [Render](https://render.com).
2. Click **New** &rarr; **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `priora-backend`
   - **Region**: Choose closest to your Supabase region (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Port listened by Render |
   | `SUPABASE_URL` | `https://<your-project>.supabase.co` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` | Supabase API key |
   | `JWT_SECRET` | `<random-32-char-string>` | Secret key for JWT signing |
   | `JWT_REFRESH_SECRET`| `<random-32-char-string>` | Secret key for refresh tokens |
   | `GEMINI_API_KEY` | `<your-google-ai-api-key>` | (Optional) Google Gemini API Key |
   | `CORS_ORIGIN` | `https://priora-frontend.vercel.app` | Your Vercel frontend URL |
6. Under **Health Check Path**, enter: `/health`.
7. Click **Create Web Service**.
8. Once deployment completes, test the health check in your browser:
   `https://priora-backend.onrender.com/health` &rarr; should return `{"status":"ok"}`.

---

## 3. Vercel Frontend SPA Deployment

1. Sign up or log into [Vercel](https://vercel.com).
2. Click **Add New** &rarr; **Project** and import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend` (or keep root if using `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   | Variable | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://priora-backend.onrender.com/api` | Render backend API URL |
5. Click **Deploy**.
6. Vercel will build and publish your SPA. Ensure SPA routing works (handled automatically by `vercel.json` rewrites).

---

## 4. Post-Deployment Verification Checklist

1. [ ] **Health Check**: Visit `https://<render-url>/health` &rarr; verify `200 OK`.
2. [ ] **Employee Login**: Log in as `rahul.sharma@northstar.io` / `Employee123!`.
   - Verify Next Best Action shows `Resolve Payment API Integration` as Rank #1.
3. [ ] **Management Login**: Log in as `sarah.chen@northstar.io` / `Manager123!`.
   - Verify Operations team is marked 🟠 `Needs Attention`.
   - Verify Early Warning System displays the 14% delta.
4. [ ] **AI Assistant**: Click **AI Assistant** in top navigation, send *"Why is Operations behind?"* and verify dynamic response.
5. [ ] **CORS Verification**: Check browser console on Vercel deployment; verify zero CORS blocking errors.
