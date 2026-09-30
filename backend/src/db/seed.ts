import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

async function seed() {
  logger.info('====================================================');
  logger.info('  Starting PRIORA Seed: Northstar Technologies Data ');
  logger.info('====================================================');

  try {
    // 1. Password Hashes (bcrypt cost 10)
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const managerHash = await bcrypt.hash('Manager123!', 10);
    const employeeHash = await bcrypt.hash('Employee123!', 10);

    // 2. Clean existing records safely
    logger.info('Clearing old data...');
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('support_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('manager_overrides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('priority_recommendations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('task_priority_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('task_execution_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('task_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('task_dependencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('daily_summaries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Seed 5 Teams
    logger.info('Seeding Northstar Teams...');
    const teamsData = [
      {
        name: 'Product Engineering',
        code: 'ENG',
        description: 'Core microservices, public web applications, and customer portal architecture.',
        health_status: 'HEALTHY',
        expected_progress: 88.0,
        actual_progress: 88.0,
      },
      {
        name: 'Data & AI',
        code: 'DATA',
        description: 'Machine learning pipelines, real-time analytics, and feature store infrastructure.',
        health_status: 'HEALTHY',
        expected_progress: 85.0,
        actual_progress: 84.0,
      },
      {
        name: 'Operations',
        code: 'OPS',
        description: 'Payment gateways, transaction processing, platform security, and vendor integrations.',
        health_status: 'NEEDS_ATTENTION', // Scenario 7
        expected_progress: 82.0,
        actual_progress: 68.0,
      },
      {
        name: 'Design',
        code: 'DSGN',
        description: 'Enterprise design system, user experience research, and accessibility compliance.',
        health_status: 'HEALTHY',
        expected_progress: 90.0,
        actual_progress: 92.0,
      },
      {
        name: 'Customer Success',
        code: 'CS',
        description: 'Tier-1 enterprise accounts, SLA compliance, customer onboarding, and technical escalations.',
        health_status: 'CRITICAL_ATTENTION',
        expected_progress: 85.0,
        actual_progress: 54.0,
      },
    ];

    const { data: createdTeams, error: teamsErr } = await supabase
      .from('teams')
      .insert(teamsData)
      .select();

    if (teamsErr || !createdTeams) throw teamsErr;

    const teamMap: Record<string, string> = {};
    createdTeams.forEach((t) => (teamMap[t.code] = t.id));

    // 4. Seed Users
    logger.info('Seeding Users & Demo Accounts...');
    const usersData = [
      // Admin
      {
        name: 'Evelyn Carter',
        email: 'admin@northstar.io',
        password_hash: adminHash,
        role: 'admin',
        team_id: teamMap['ENG'],
        job_title: 'Chief Technology Officer',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      // Manager (Lead)
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@northstar.io',
        password_hash: managerHash,
        role: 'manager',
        team_id: teamMap['OPS'],
        job_title: 'VP of Engineering & Operations',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      },
      // Flagship Employee: Rahul Sharma
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['OPS'],
        job_title: 'Senior Integration Engineer',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      // Employee: Priya Patel
      {
        name: 'Priya Patel',
        email: 'priya.patel@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['ENG'],
        job_title: 'Staff Full-Stack Engineer',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
      // Employee: Aman Verma (Scenario 2: Deviation)
      {
        name: 'Aman Verma',
        email: 'aman.verma@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['DATA'],
        job_title: 'Senior Data Infrastructure Engineer',
        attention_status: 'NEEDS_ATTENTION',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      // Employee: Neha Gupta
      {
        name: 'Neha Gupta',
        email: 'neha.gupta@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['DSGN'],
        job_title: 'Principal Product Designer',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
      // Employee: Alex Miller
      {
        name: 'Alex Miller',
        email: 'alex.miller@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['CS'],
        job_title: 'Enterprise Technical Lead',
        attention_status: 'CRITICAL_ATTENTION',
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      },
      // Marcus Vance
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['ENG'],
        job_title: 'Backend Platform Engineer',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
      // Elena Rostova
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['DATA'],
        job_title: 'MLOps Architect',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      },
      // David Kim - Engineering Manager
      {
        name: 'David Kim',
        email: 'david.kim@northstar.io',
        password_hash: managerHash,
        role: 'manager',
        team_id: teamMap['ENG'],
        job_title: 'Engineering Operations Lead',
        attention_status: 'HEALTHY',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      },
      // Sophia Taylor
      {
        name: 'Sophia Taylor',
        email: 'sophia.taylor@northstar.io',
        password_hash: employeeHash,
        role: 'employee',
        team_id: teamMap['CS'],
        job_title: 'Senior Solutions Architect',
        attention_status: 'NEEDS_ATTENTION',
        avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      },
    ];

    const { data: createdUsers, error: usersErr } = await supabase
      .from('users')
      .insert(usersData)
      .select();

    if (usersErr || !createdUsers) throw usersErr;

    const userMap: Record<string, string> = {};
    createdUsers.forEach((u) => (userMap[u.email] = u.id));

    // Update Team Leads
    await supabase.from('teams').update({ lead_id: userMap['sarah.chen@northstar.io'] }).eq('code', 'OPS');
    await supabase.from('teams').update({ lead_id: userMap['priya.patel@northstar.io'] }).eq('code', 'ENG');

    // 5. Seed Projects
    logger.info('Seeding Enterprise Projects...');
    const projectsData = [
      {
        name: 'Global Payment Gateway v3',
        description: 'Multi-currency checkout orchestration with Stripe & Adyen failover engines.',
        team_id: teamMap['OPS'],
        priority: 'CRITICAL',
        status: 'ACTIVE',
        target_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
      {
        name: 'Enterprise Core Services',
        description: 'Scalable auth, tenancy partitioning, and RBAC authorization framework.',
        team_id: teamMap['ENG'],
        priority: 'HIGH',
        status: 'ACTIVE',
        target_date: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
      {
        name: 'Real-Time Feature Store',
        description: 'Sub-millisecond machine learning inference pipeline for fraud detection.',
        team_id: teamMap['DATA'],
        priority: 'HIGH',
        status: 'ACTIVE',
        target_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      {
        name: 'Design System 2.0 (Aurora)',
        description: 'Accessible token system and micro-interaction components for web applications.',
        team_id: teamMap['DSGN'],
        priority: 'MEDIUM',
        status: 'ACTIVE',
        target_date: new Date(Date.now() + 21 * 86400000).toISOString(),
      },
      {
        name: 'Tier-1 Enterprise Escalations',
        description: 'Immediate SLA resolution for Fortune 500 strategic deployments.',
        team_id: teamMap['CS'],
        priority: 'CRITICAL',
        status: 'ACTIVE',
        target_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      },
    ];

    const { data: createdProjects, error: projErr } = await supabase
      .from('projects')
      .insert(projectsData)
      .select();

    if (projErr || !createdProjects) throw projErr;
    const projectMap: Record<string, string> = {};
    createdProjects.forEach((p) => (projectMap[p.name] = p.id));

    // 6. Seed Tasks (100+ tasks, with exact Flagship Scenarios)
    logger.info('Seeding Tasks & Dependencies (100+ tasks)...');
    const tasksToInsert: any[] = [];
    const now = Date.now();
    const todayEnd = new Date();
    todayEnd.setHours(17, 0, 0, 0);

    // =================================================================
    // RAHUL SHARMA'S 10 TASKS (MANDATORY SCENARIOS 1 & 3)
    // Note: Task #6 is "Resolve Payment API Integration"
    // =================================================================
    const rahulId = userMap['rahul.sharma@northstar.io'];
    const sarahId = userMap['sarah.chen@northstar.io'];
    const paymentProjId = projectMap['Global Payment Gateway v3'];

    const rahul10Tasks = [
      {
        task_code: 'TSK-1001',
        title: 'Review Weekly Infrastructure Logs',
        description: 'Audit CloudWatch log alerts for unusual spikes in TLS handshake errors.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'LOW',
        business_impact: 'LOW',
        deadline: new Date(now + 4 * 86400000).toISOString(),
        estimated_minutes: 45,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 9,
      },
      {
        task_code: 'TSK-1002',
        title: 'Prepare Monthly Ops Performance Report',
        description: 'Aggregate monthly availability SLA metrics for executive team review.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'LOW',
        business_impact: 'LOW',
        deadline: new Date(now + 5 * 86400000).toISOString(),
        estimated_minutes: 60,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 10,
      },
      {
        task_code: 'TSK-1003',
        title: 'Update Vendor Webhook Endpoints',
        description: 'Add new webhook URL to external payment providers staging sandbox.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'MEDIUM',
        business_impact: 'MEDIUM',
        deadline: new Date(now + 2 * 86400000).toISOString(),
        estimated_minutes: 90,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 4,
      },
      {
        task_code: 'TSK-1004',
        title: 'Refactor Transaction Retry Worker',
        description: 'Implement exponential backoff algorithm on failed webhook deliveries.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'MEDIUM',
        business_impact: 'HIGH',
        deadline: new Date(now + 1 * 86400000).toISOString(),
        estimated_minutes: 120,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        is_carried_forward: true, // Carried over from yesterday!
        current_rank: 3,
      },
      {
        task_code: 'TSK-1005',
        title: 'Audit Stripe Webhook Signature Verification',
        description: 'Verify HMAC SHA-256 header validation on Stripe raw request payloads.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'HIGH',
        business_impact: 'HIGH',
        deadline: new Date(now + 18 * 3600000).toISOString(),
        estimated_minutes: 90,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        is_carried_forward: true, // 2nd carried forward task!
        current_rank: 2,
      },
      // ---> THE FLAGSHIP TASK #6: AI MUST MOVE TO RANK #1! <---
      {
        task_code: 'TSK-1006',
        title: 'Resolve Payment API Integration',
        description: 'Critical payment gateway token exchange fails under high concurrency. Downstream testing and production release are completely blocked until this is patched.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'CRITICAL',
        business_impact: 'CRITICAL',
        deadline: todayEnd.toISOString(), // DUE TODAY!
        estimated_minutes: 135, // 2h 15m!
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 1, // NEXT BEST ACTION!
        priority_score: 98.50,
        recommendation_reason: 'CRITICAL: Due today at 5:00 PM. Directly blocks 3 downstream tasks (API Testing, Reconciliation, Production Release). Manager-designated critical path.',
      },
      // Downstream task 1 blocked by TSK-1006
      {
        task_code: 'TSK-1007',
        title: 'Complete Payment API End-to-End Testing',
        description: 'Execute automated regression test suite on multi-currency payment flows.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'HIGH',
        business_impact: 'HIGH',
        deadline: new Date(now + 24 * 3600000).toISOString(),
        estimated_minutes: 90,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 5,
      },
      // Downstream task 2 blocked by TSK-1006
      {
        task_code: 'TSK-1008',
        title: 'Payment Gateway Reconciliation Service',
        description: 'Ensure automated ledger entry matches external provider settlement reports.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'HIGH',
        business_impact: 'HIGH',
        deadline: new Date(now + 36 * 3600000).toISOString(),
        estimated_minutes: 110,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 6,
      },
      // Downstream task 3 blocked by TSK-1006
      {
        task_code: 'TSK-1009',
        title: 'Checkout Service Production Release',
        description: 'Deploy canary version 3.2.0 to 10% of European production traffic.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'CRITICAL',
        business_impact: 'CRITICAL',
        deadline: new Date(now + 48 * 3600000).toISOString(),
        estimated_minutes: 75,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 7,
      },
      {
        task_code: 'TSK-1010',
        title: 'Internal API Documentation & Runbook',
        description: 'Document secret rotation procedure for Adyen and Stripe webhook keys.',
        project_id: paymentProjId,
        team_id: teamMap['OPS'],
        assigned_to: rahulId,
        created_by: sarahId,
        priority: 'LOW',
        business_impact: 'LOW',
        deadline: new Date(now + 72 * 3600000).toISOString(),
        estimated_minutes: 60,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 8,
      },
    ];

    tasksToInsert.push(...rahul10Tasks);

    // =================================================================
    // AMAN VERMA'S TASKS (SCENARIO 2: PRIORITY DEVIATION)
    // =================================================================
    const amanId = userMap['aman.verma@northstar.io'];
    const dataProjId = projectMap['Real-Time Feature Store'];

    const amanTasks = [
      {
        task_code: 'TSK-2001',
        title: 'Kafka Ingestion Pipeline Heartbeat Check',
        description: 'Verify consumer group lag metrics on financial telemetry topics.',
        project_id: dataProjId,
        team_id: teamMap['DATA'],
        assigned_to: amanId,
        created_by: sarahId,
        priority: 'MEDIUM',
        business_impact: 'MEDIUM',
        deadline: new Date(now + 12 * 3600000).toISOString(),
        estimated_minutes: 45,
        actual_minutes: 45,
        status: 'COMPLETED',
        current_rank: 1,
      },
      {
        task_code: 'TSK-2002',
        title: 'Data Pipeline Validation & Schema Enforcement',
        description: 'Strict Avro schema verification before data writes to feature table. System recommended doing this first!',
        project_id: dataProjId,
        team_id: teamMap['DATA'],
        assigned_to: amanId,
        created_by: sarahId,
        priority: 'CRITICAL',
        business_impact: 'CRITICAL',
        deadline: new Date(now + 18 * 3600000).toISOString(),
        estimated_minutes: 90,
        actual_minutes: 0,
        status: 'NOT_STARTED',
        current_rank: 2, // RECOMMENDED FIRST!
      },
      {
        task_code: 'TSK-2003',
        title: 'Feature Store Optimization & Memory Tuning',
        description: 'Tuning Redis caching cluster for sub-5ms feature lookups.',
        project_id: dataProjId,
        team_id: teamMap['DATA'],
        assigned_to: amanId,
        created_by: sarahId,
        priority: 'MEDIUM',
        business_impact: 'MEDIUM',
        deadline: new Date(now + 3 * 86400000).toISOString(),
        estimated_minutes: 120,
        actual_minutes: 48,
        status: 'IN_PROGRESS', // Aman started this before #2!
        current_rank: 3,
      },
    ];

    tasksToInsert.push(...amanTasks);

    // =================================================================
    // GENERATE 90+ REALISTIC TASKS ACROSS ALL 5 TEAMS
    // =================================================================
    const userEmails = Object.keys(userMap);
    const projectNames = Object.keys(projectMap);

    const taskTemplates = [
      { title: 'Migrate Redis Cluster to TLS 1.3', team: 'OPS', prio: 'HIGH', imp: 'HIGH', est: 90 },
      { title: 'Implement OAuth2 PKCE Flow in Mobile App', team: 'ENG', prio: 'CRITICAL', imp: 'CRITICAL', est: 120 },
      { title: 'Resolve Customer Escalation: Order Sync Delay', team: 'CS', prio: 'CRITICAL', imp: 'CRITICAL', est: 60, status: 'BLOCKED' },
      { title: 'Accessibility Contrast Audit on Modal Dialogs', team: 'DSGN', prio: 'MEDIUM', imp: 'MEDIUM', est: 75 },
      { title: 'Backfill Missing Vector Embeddings in Pinecone', team: 'DATA', prio: 'HIGH', imp: 'MEDIUM', est: 180 },
      { title: 'Database Connection Pool Exhaustion Incident Triage', team: 'OPS', prio: 'CRITICAL', imp: 'CRITICAL', est: 90, status: 'BLOCKED' },
      { title: 'Customer Onboarding Sandbox Setup for Acme Corp', team: 'CS', prio: 'HIGH', imp: 'HIGH', est: 110, status: 'BLOCKED' },
      { title: 'Design Figma Tokens for Dark/Light Mode Tokens', team: 'DSGN', prio: 'HIGH', imp: 'HIGH', est: 140 },
      { title: 'Docker Container Vulnerability Remediation (CVE-2026)', team: 'ENG', prio: 'HIGH', imp: 'CRITICAL', est: 60 },
      { title: 'Refactor GraphQL Resolver Batching with DataLoader', team: 'ENG', prio: 'MEDIUM', imp: 'MEDIUM', est: 100 },
      { title: 'PostgreSQL Vacuum Analyze and Bloat Reclaim', team: 'DATA', prio: 'MEDIUM', imp: 'MEDIUM', est: 120 },
      { title: 'Configure Cross-Region Disaster Recovery Replication', team: 'OPS', prio: 'CRITICAL', imp: 'HIGH', est: 240 },
      { title: 'Design Typography Hierarchy Specs for Desktop & Tablet', team: 'DSGN', prio: 'LOW', imp: 'LOW', est: 60 },
      { title: 'Resolve Client Webhook Timeout Alert (#4902)', team: 'CS', prio: 'CRITICAL', imp: 'CRITICAL', est: 45 },
      { title: 'Implement Rate Limiting on Public Authentication Routes', team: 'ENG', prio: 'HIGH', imp: 'HIGH', est: 80 },
    ];

    let taskCounter = 2004;
    for (let i = 0; i < 90; i++) {
      const tmpl = taskTemplates[i % taskTemplates.length];
      const assigneeEmail = userEmails[(i + 2) % userEmails.length];
      const projName = projectNames[i % projectNames.length];
      const teamId = teamMap[tmpl.team] || teamMap['ENG'];
      const deadlineDays = 1 + (i % 7);

      tasksToInsert.push({
        task_code: `TSK-${taskCounter++}`,
        title: `${tmpl.title} (Batch ${Math.floor(i / 15) + 1})`,
        description: `Operational deliverable tracked under enterprise sprint commitment. Priority verified by team lead.`,
        project_id: projectMap[projName],
        team_id: teamId,
        assigned_to: userMap[assigneeEmail],
        created_by: sarahId,
        priority: tmpl.prio,
        business_impact: tmpl.imp,
        deadline: new Date(now + deadlineDays * 86400000).toISOString(),
        estimated_minutes: tmpl.est,
        actual_minutes: tmpl.team === 'ENG' || tmpl.team === 'DSGN' ? tmpl.est : (i % 2 === 0 ? tmpl.est : 0),
        status: (() => {
          if (tmpl.team === 'ENG') return (i % 10 < 9) ? 'COMPLETED' : 'IN_PROGRESS';
          if (tmpl.team === 'DATA') return (i % 10 < 8) ? 'COMPLETED' : 'IN_PROGRESS';
          if (tmpl.team === 'DSGN') return (i % 10 < 9) ? 'COMPLETED' : 'IN_PROGRESS';
          if (tmpl.team === 'CS') return (i % 10 < 5) ? 'COMPLETED' : (i % 10 < 7 ? 'BLOCKED' : 'NOT_STARTED');
          // OPS: ~68%
          return (i % 10 < 7) ? 'COMPLETED' : (i % 10 === 7 ? 'BLOCKED' : 'IN_PROGRESS');
        })(),
        current_rank: (i % 10) + 1,
      });
    }

    logger.info(`Inserting ${tasksToInsert.length} tasks...`);
    const { data: createdTasks, error: tasksInsertErr } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (tasksInsertErr || !createdTasks) throw tasksInsertErr;
    logger.info(`Successfully created ${createdTasks.length} tasks!`);

    const taskMap: Record<string, string> = {};
    createdTasks.forEach((t) => {
      if (t.task_code) taskMap[t.task_code] = t.id;
    });

    // 7. Seed Task Dependencies (Mandatory: TSK-1006 blocks TSK-1007, TSK-1008, TSK-1009)
    logger.info('Wiring Task Dependencies (TSK-1006 blocks 3 downstream tasks)...');
    const flagshipId = taskMap['TSK-1006'];
    const dep1Id = taskMap['TSK-1007'];
    const dep2Id = taskMap['TSK-1008'];
    const dep3Id = taskMap['TSK-1009'];

    if (flagshipId && dep1Id && dep2Id && dep3Id) {
      await supabase.from('task_dependencies').insert([
        { task_id: dep1Id, depends_on_task_id: flagshipId },
        { task_id: dep2Id, depends_on_task_id: flagshipId },
        { task_id: dep3Id, depends_on_task_id: flagshipId },
      ]);
    }

    // 8. Seed Priority Recommendations for Rahul (Rank #1 = TSK-1006)
    logger.info('Seeding Priority Recommendations for Next Best Action...');
    if (flagshipId) {
      await supabase.from('priority_recommendations').insert({
        task_id: flagshipId,
        employee_id: rahulId,
        rank: 1,
        priority_score: 98.50,
        reason_summary: 'Critical business impact with approaching deadline. Blocks 3 downstream tasks (API Testing, Reconciliation, Release).',
        factors: [
          { factor: 'Critical business impact', description: 'Core payment gateway token exchange fails under high concurrency.', impact: 'HIGH' },
          { factor: 'Deadline approaching', description: 'Scheduled for completion today by 5:00 PM.', impact: 'HIGH' },
          { factor: 'Blocking 3 downstream tasks', description: 'Blocks API Testing, Reconciliation Service, and Production Release.', impact: 'HIGH' },
          { factor: 'Manager-defined priority', description: 'Flagged as top critical path by Sarah Chen.', impact: 'HIGH' },
        ],
        is_active: true,
      });
    }

    // 9. Seed Daily Summary for Rahul (Completed: 7, Incomplete: 3, Carried Forward: 2)
    logger.info('Seeding Yesterday Daily Summary for Rahul...');
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    await supabase.from('daily_summaries').insert({
      employee_id: rahulId,
      date: yesterdayDate,
      completed_count: 7,
      incomplete_count: 3,
      carried_forward_count: 2,
      total_minutes_logged: 410,
    });

    // 10. Seed Priority Deviation Event for Aman Verma (Scenario 2)
    logger.info('Seeding Priority Deviation Event (Aman Verma)...');
    const amanDevTaskId = taskMap['TSK-2003'];
    if (amanDevTaskId) {
      await supabase.from('task_execution_events').insert({
        task_id: amanDevTaskId,
        user_id: amanId,
        event_type: 'PRIORITY_DEVIATION',
        metadata: {
          employee: 'Aman Verma',
          team: 'Data & AI',
          startedTaskId: amanDevTaskId,
          startedTitle: 'Feature Store Optimization & Memory Tuning',
          startedRank: 3,
          recommendedRank: 2,
          message: 'Task #3 was started before currently recommended Task #2 ("Data Pipeline Validation").',
          elapsedMinutes: 48,
        },
      });

      await supabase.from('notifications').insert({
        user_id: amanId,
        team_id: teamMap['DATA'],
        type: 'PRIORITY_DEVIATION',
        severity: 'ORANGE',
        title: 'Priority Deviation Detected',
        message: 'Aman Verma (Data & AI): Task #3 started before recommended Task #2 (Elapsed: 48 mins)',
        task_id: amanDevTaskId,
      });
    }

    // 11. Seed Additional Operational Alerts (Attention Center)
    logger.info('Seeding Notifications & Attention Signals...');
    await supabase.from('notifications').insert([
      {
        team_id: teamMap['OPS'],
        type: 'TEAM_SLOWDOWN',
        severity: 'ORANGE',
        title: 'Operations Progress Slower Than Expected',
        message: 'Operations team progress (68%) is 14% below target (82%). 3 delayed tasks and 1 blocked dependency detected.',
        task_id: flagshipId,
      },
      {
        team_id: teamMap['CS'],
        type: 'POTENTIAL_BLOCKER',
        severity: 'RED',
        title: 'Customer Success Critical Blocker',
        message: 'Tier-1 enterprise escalation blocked awaiting engineering token fix.',
      },
      {
        team_id: teamMap['OPS'],
        type: 'DEADLINE_RISK',
        severity: 'ORANGE',
        title: 'Approaching Milestone Deadline',
        message: 'Global Payment Gateway v3 milestone due in 3 days with 1 open critical path item.',
        task_id: flagshipId,
      },
    ]);

    logger.info('====================================================');
    logger.info('  PRIORA Database Seed Completed Successfully!     ');
    logger.info('  - 5 Teams created with authentic health stats    ');
    logger.info('  - 11 Verified Users with bcrypt hashed passwords ');
    logger.info('  - 100+ Tasks seeded with dependency graph        ');
    logger.info('  - Mandatory Scenarios 1 to 8 fully wired!        ');
    logger.info('====================================================');
  } catch (error: any) {
    logger.error('Seed script encountered error:', error.message || error);
    process.exit(1);
  }
}

seed();
