import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_MANAGERS, DEMO_EMPLOYEES } from '../../store/AuthContext';
import {
  Sparkles,
  Play,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Video,
  MonitorPlay,
  RotateCcw,
} from 'lucide-react';

interface GuidedDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiAssistant?: () => void;
}

interface TourStep {
  title: string;
  badge: string;
  persona: 'manager' | 'employee' | 'overview';
  route: string;
  narration: string;
  keyFeature: string;
  actionPrompt: string;
  actionText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '1. The Problem: Fragmented Data & Decision Fatigue',
    badge: 'Enterprise Dilemma',
    persona: 'overview',
    route: '/login',
    narration:
      'Judges, modern enterprise teams suffer from disconnected tools and decision fatigue. Employees waste mental energy every morning guessing what to work on next, while managers discover critical execution bottlenecks weeks too late. PRIORA is an intelligent work orchestration platform built to solve this.',
    keyFeature: 'Multi-persona enterprise orchestration platform with live role-based simulation.',
    actionPrompt: 'Start with the Executive Management view to see how problems are caught early.',
    actionText: 'Switch to Sarah Chen (VP Operations)',
  },
  {
    title: '2. Executive Visibility: Catching Problems Early',
    badge: 'Management Oversight',
    persona: 'manager',
    route: '/management/dashboard',
    narration:
      "As VP of Operations, Sarah Chen does not sift through hundreds of unorganized Jira tickets. The Team Health Matrix immediately flags that Operations is in 'Needs Attention' status with a 14% execution variance, caused by 3 delayed tasks and 1 blocked engineer.",
    keyFeature: 'Team Health Matrix & Priority Adherence Index tracking objective execution telemetry.',
    actionPrompt: 'Observe the Early Warning Signals before drilling into the frontline execution.',
    actionText: 'View Frontline Next Best Action (Rahul Sharma)',
  },
  {
    title: '3. Frontline Focus: The Next Best Action',
    badge: 'Employee Execution',
    persona: 'employee',
    route: '/employee/dashboard',
    narration:
      "Now in Rahul Sharma's shoes as a senior engineer. Instead of a chaotic list of 10 tasks, PRIORA calculates a single Next Best Action: 'Resolve Payment API Integration'. Rahul doesn't have to decide what to do next—his queue is already prioritized around organizational impact.",
    keyFeature: 'Autonomous multi-factor prioritization engine ranking tasks by urgency, impact, and dependencies.',
    actionPrompt: 'Inspect the transparent business factors explaining why this task is #1.',
    actionText: 'Inspect Explainable Business Reasoning',
  },
  {
    title: '4. Explainable AI: Multi-Factor Business Reasoning',
    badge: 'Explainability & Trust',
    persona: 'employee',
    route: '/employee/dashboard',
    narration:
      'Unlike black-box algorithms, PRIORA explains every recommendation in plain business terms: this task is due today by 5:00 PM, directly blocks 3 downstream engineers (API Testing, Reconciliation, Production Release), and carries an active manager priority override.',
    keyFeature: 'Full explainability breakdown: Deadline Pressure, Business Impact, Dependency Criticality, and Downstream Risk.',
    actionPrompt: 'Simulate what happens when an unexpected blocker occurs in production.',
    actionText: 'Test Blocker Escalation & Management Loop',
  },
  {
    title: '5. The Closed Loop: Instant Blocker Escalation',
    badge: 'Operational Telemetry',
    persona: 'manager',
    route: '/management/dashboard',
    narration:
      'When Rahul encounters an external dependency failure, he flags it with 1 click. PRIORA records the event, updates his status to Needs Attention, alerts Sarah Chen in the Executive Attention Center, and reprioritizes the team without manual meetings.',
    keyFeature: 'Closed feedback loop: Plan → Prioritize → Execute → Detect → Support → Reprioritize.',
    actionPrompt: 'Ask the interactive AI Assistant to analyze why operations is experiencing friction.',
    actionText: 'Launch Live AI Management Assistant',
  },
  {
    title: '6. Live AI Assistant & Hackathon Conclusion',
    badge: 'Intelligent Orchestration',
    persona: 'manager',
    route: '/management/dashboard',
    narration:
      "Managers can query the AI Assistant drawer in natural language: 'Why is Operations behind?' PRIORA analyzes live database telemetry to generate actionable insights. In 3 minutes, you have seen how PRIORA ends decision fatigue for employees and eliminates blind spots for leadership.",
    keyFeature: 'Hybrid AI Assistant powered by Google Gemini 1.5 Flash with live database context.',
    actionPrompt: 'You are now ready to record your video or present live to judges!',
    actionText: 'Restart Demo Tour',
  },
];

export const GuidedDemoTour: React.FC<GuidedDemoTourProps> = ({
  isOpen,
  onClose,
  onOpenAiAssistant,
}) => {
  const navigate = useNavigate();
  const { loginWithAccount } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleStepAction = async () => {
    if (currentStep.persona === 'manager') {
      const sarah = DEMO_MANAGERS[0];
      await loginWithAccount(sarah);
      navigate('/management/dashboard');
    } else if (currentStep.persona === 'employee') {
      const rahul = DEMO_EMPLOYEES[0];
      await loginWithAccount(rahul);
      navigate('/employee/dashboard');
    } else {
      navigate('/login');
    }

    if (currentStepIndex === 4 && onOpenAiAssistant) {
      onOpenAiAssistant();
    }

    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setCurrentStepIndex(0);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm page-enter-animation">
      <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-primary text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
              <MonitorPlay className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">PRIORA Interactive Video & Demo Guide</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent/40 text-accent-light">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                3–5 Minute Hackathon Presentation & Video Recording Storyboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Step Badge & Title */}
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1.5">
              {currentStep.badge}
            </span>
            <h4 className="text-lg font-bold text-primary tracking-tight">
              {currentStep.title}
            </h4>
          </div>

          {/* Teleprompter / Speaker Narration Script */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Video className="w-3.5 h-3.5" />
              <span>What to Say in Video / Demo Narration:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
              "{currentStep.narration}"
            </p>
          </div>

          {/* Key Architectural & Value Highlights */}
          <div className="bg-slate-50 border border-border rounded-xl p-3.5 space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary font-semibold">Hackathon Value Highlight: </strong>
                <span className="text-secondary">{currentStep.keyFeature}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary font-semibold">On-Screen Action: </strong>
                <span className="text-secondary">{currentStep.actionPrompt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 border border-border bg-white hover:bg-slate-100 text-secondary disabled:opacity-40 rounded-xl text-xs font-semibold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === TOUR_STEPS.length - 1}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 border border-border bg-white hover:bg-slate-100 text-secondary disabled:opacity-40 rounded-xl text-xs font-semibold transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-Execute Action Button */}
          <button
            onClick={handleStepAction}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <span>{currentStep.actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
