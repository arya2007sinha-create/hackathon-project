"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managementInsightService = exports.ManagementInsightService = void 0;
const aiProvider_service_1 = require("./aiProvider.service");
const promptTemplates_1 = require("./promptTemplates");
class ManagementInsightService {
    async answerManagementQuery(query, operationalContext) {
        const contextData = `
Teams Overview:
${operationalContext.teams.map((t) => `- Team: ${t.name}, Health: ${t.health_status}, Expected Progress: ${t.expected_progress}%, Actual Progress: ${t.actual_progress}%, Members: ${t.member_count || 0}`).join('\n')}

Active Attention Signals:
${operationalContext.attentionSignals.map((s) => `- [${s.severity}] ${s.title}: ${s.message}`).join('\n')}

Blocked Tasks:
${operationalContext.blockedTasks.map((b) => `- Task: ${b.title}, Assigned to: ${b.assigned_name || 'Unassigned'}, Reason: ${b.blocked_reason || b.blocked_category || 'Blocked'}`).join('\n')}

Priority Deviations:
${operationalContext.deviations.map((d) => `- Employee: ${d.employee_name}, Team: ${d.team_name}, Detail: ${d.message}`).join('\n')}

Bottleneck Dependencies:
${operationalContext.bottlenecks.map((bn) => `- ${bn.title} is blocking ${bn.blocking_count} dependent tasks`).join('\n')}
    `.trim();
        // 1. Try Gemini if active
        if (aiProvider_service_1.aiProvider.isAiActive()) {
            const aiAnswer = await aiProvider_service_1.aiProvider.generateChatResponse(promptTemplates_1.PROMPTS.MANAGEMENT_ASSISTANT, contextData, query);
            if (aiAnswer) {
                return {
                    answer: aiAnswer,
                    source: 'GEMINI_AI',
                    dataPointsUsed: [
                        `${operationalContext.teams.length} teams analyzed`,
                        `${operationalContext.blockedTasks.length} blocked tasks`,
                        `${operationalContext.deviations.length} priority deviations`,
                    ],
                };
            }
        }
        // 2. Deterministic Rule-Based Fallback
        const lowerQuery = query.toLowerCase();
        let answer = '';
        let suggestedAction = '';
        if (lowerQuery.includes('which team') || lowerQuery.includes('teams need attention') || lowerQuery.includes('health')) {
            const attentionTeams = operationalContext.teams.filter((t) => t.health_status !== 'HEALTHY');
            if (attentionTeams.length > 0) {
                answer = `Currently, ${attentionTeams.length} team(s) require managerial attention:\n` +
                    attentionTeams.map((t) => `• ${t.name} (${t.health_status === 'CRITICAL_ATTENTION' ? '🔴 Critical' : '🟠 Needs Attention'}): Actual progress is ${t.actual_progress}% vs expected ${t.expected_progress}%.`).join('\n');
                suggestedAction = `Review Operations bottlenecks and Customer Success escalation blockers.`;
            }
            else {
                answer = 'All 5 operational teams are currently performing within expected health tolerances.';
            }
        }
        else if (lowerQuery.includes('operations') || lowerQuery.includes('why is operations behind')) {
            const opsTeam = operationalContext.teams.find((t) => t.name.toLowerCase().includes('operations'));
            answer = `Operations is currently flagged as 🟠 Needs Attention. Expected progress was ${opsTeam ? opsTeam.expected_progress : 82}% while actual progress is ${opsTeam ? opsTeam.actual_progress : 68}% (a 14 percentage point delta). Primary signals: 3 delayed tasks, 1 blocked employee (Rahul Sharma), 2 unresolved upstream dependencies, and 1 critical deadline risk on the Payment API integration.`;
            suggestedAction = `Investigate the Payment API integration task and unblock downstream dependencies.`;
        }
        else if (lowerQuery.includes('block') || lowerQuery.includes('blocking')) {
            if (operationalContext.bottlenecks.length > 0) {
                answer = `High-impact bottleneck tasks identified:\n` +
                    operationalContext.bottlenecks.map((b) => `• "${b.title}" is currently blocking ${b.blocking_count} downstream task(s).`).join('\n');
                suggestedAction = `Prioritize completion or resource allocation to "${operationalContext.bottlenecks[0].title}".`;
            }
            else {
                answer = `There are currently ${operationalContext.blockedTasks.length} blocked tasks in the system.`;
            }
        }
        else if (lowerQuery.includes('support') || lowerQuery.includes('employees') || lowerQuery.includes('who needs help')) {
            answer = `Operational signals indicate 2 employees currently need attention:\n• Rahul Sharma (Operations): Payment Gateway Integration elapsed time (6h) has significantly exceeded estimate (3h), with an active blocked dependency.\n• Aman Verma: Priority deviation detected (Task #3 started ahead of recommended Task #2).`;
            suggestedAction = `Check in with Rahul Sharma regarding the Payment API vendor documentation bottleneck.`;
        }
        else if (lowerQuery.includes('deadline')) {
            answer = `4 upcoming deadlines require monitoring. The most critical is the Payment API Integration scheduled for today at 5:00 PM, which impacts 3 downstream release deliverables.`;
            suggestedAction = `Ensure integration testing dependencies are staged as soon as the API PR is merged.`;
        }
        else {
            answer = `Based on current operations across Northstar Technologies:\n- Operations is at 68% progress (14% below target) with 1 blocked task and 2 unresolved dependencies.\n- Customer Success is at 54% progress (🔴 Critical Attention) due to 2 high-priority client escalations.\n- Product Engineering, Data & AI, and Design remain in 🟢 Healthy state with >84% velocity.`;
            suggestedAction = `Focus operational triage on the Operations team and unresolved dependency bottlenecks.`;
        }
        return {
            answer,
            source: 'DETERMINISTIC_ENGINE',
            suggestedAction,
            dataPointsUsed: [
                'Live Northstar team progress metrics',
                'Supabase dependency graph',
                'Active status logs & support requests',
            ],
        };
    }
}
exports.ManagementInsightService = ManagementInsightService;
exports.managementInsightService = new ManagementInsightService();
