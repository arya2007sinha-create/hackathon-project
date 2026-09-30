import { aiProvider } from './aiProvider.service';
import { PROMPTS } from './promptTemplates';
import { Task } from '../types';

export interface ExplainableFactor {
  factor: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ExplanationResult {
  summary: string;
  factors: ExplainableFactor[];
  isAiGenerated: boolean;
}

export class PriorityExplanationService {
  public async explainNextBestAction(task: Task, blockingCount: number = 0): Promise<ExplanationResult> {
    // 1. Try Gemini if active
    if (aiProvider.isAiActive()) {
      const userContext = JSON.stringify({
        taskTitle: task.title,
        description: task.description,
        priority: task.priority,
        businessImpact: task.business_impact,
        deadline: task.deadline,
        estimatedMinutes: task.estimated_minutes,
        blockingCount,
        isCarriedForward: task.is_carried_forward,
      });

      const aiResult = await aiProvider.generateStructuredJson<{
        summary: string;
        factors: ExplainableFactor[];
      }>(PROMPTS.EXPLAIN_NEXT_BEST_ACTION, userContext);

      if (aiResult && aiResult.factors && aiResult.factors.length > 0) {
        return {
          summary: aiResult.summary || `Task prioritized due to ${task.priority.toLowerCase()} priority and operational dependencies.`,
          factors: aiResult.factors,
          isAiGenerated: true,
        };
      }
    }

    // 2. Deterministic Rule-Based Fallback
    const factors: ExplainableFactor[] = [];

    // Business Impact factor
    if (task.business_impact === 'CRITICAL' || task.priority === 'CRITICAL') {
      factors.push({
        factor: 'Critical business impact',
        description: 'Directly impacts primary production services or customer SLA obligations.',
        impact: 'HIGH',
      });
    } else if (task.business_impact === 'HIGH' || task.priority === 'HIGH') {
      factors.push({
        factor: 'High business priority',
        description: 'Key milestone deliverable for the current development sprint.',
        impact: 'HIGH',
      });
    }

    // Deadline Urgency factor
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 12) {
      factors.push({
        factor: 'Deadline approaching',
        description: 'Scheduled for completion today to prevent delivery delays.',
        impact: 'HIGH',
      });
    } else if (diffHours <= 36) {
      factors.push({
        factor: 'Near-term deadline',
        description: 'Due within the next 24-36 hours.',
        impact: 'MEDIUM',
      });
    }

    // Blocking downstream factor
    if (blockingCount > 0) {
      factors.push({
        factor: `Blocking ${blockingCount} downstream tasks`,
        description: `Other team members are awaiting this deliverable before starting their work.`,
        impact: 'HIGH',
      });
    }

    // Carried over factor
    if (task.is_carried_forward) {
      factors.push({
        factor: 'Carried forward from yesterday',
        description: 'Unfinished high-value work automatically incorporated into today’s schedule.',
        impact: 'MEDIUM',
      });
    }

    // Manager priority factor
    factors.push({
      factor: 'Manager-defined priority',
      description: `Aligned with management priority level: ${task.priority}.`,
      impact: task.priority === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
    });

    const summary = `${task.title} is prioritized due to ${task.priority.toLowerCase()} priority, ${blockingCount > 0 ? `blocking ${blockingCount} downstream items, ` : ''}and time-sensitive deadlines.`;

    return {
      summary,
      factors,
      isAiGenerated: false,
    };
  }
}

export const priorityExplanationService = new PriorityExplanationService();
