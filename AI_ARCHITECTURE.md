# PRIORA &mdash; AI System Architecture & Reasoning Engine

## 1. AI Integration Strategy

In enterprise workflows, relying 100% on a black-box Large Language Model (LLM) introduces latency, non-deterministic drift, and hallucination risks.

PRIORA implements a **Hybrid AI Architecture**:
1. **Deterministic Business Core**: Strict mathematical algorithms handle quantifiable constraints (deadlines, downstream dependency counts, manager weights, and carry-over penalties).
2. **Generative AI Layer (Google Gemini 1.5 Flash)**: Synthesizes complex multi-dimensional operational context into concise, explainable business reasoning and powers the executive management assistant.
3. **Resilient Fallback**: If the external AI service is unreachable, rate-limited, or unconfigured, the application operates deterministically without degradation.

---

## 2. Component Architecture

```
                    ┌───────────────────────────┐
                    │   Incoming Work Context   │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │  Priority Engine (Service)  │
                   │  7 Weighted Quant Factors   │
                   └──────────────┬──────────────┘
                                  │
             ┌────────────────────┴────────────────────┐
             │                                         │
             ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│     Gemini 1.5 Flash    │               │  Deterministic Explain  │
│  (Structured JSON Mode) │               │     (Fallback Engine)   │
└────────────┬────────────┘               └────────────┬────────────┘
             │                                         │
             └────────────────────┬────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │    Explainable Rationale  │
                    │   3-4 Objective Factors   │
                    └───────────────────────────┘
```

---

## 3. Strict Guardrails & Anti-Hallucination Constraints

The AI engine operates under strict programmatic constraints:

### What Gemini IS Responsible For:
- Formulating concise, executive-level business rationales for why a task is prioritized.
- Synthesizing cross-team operational patterns for managers.
- Explaining the downstream blast radius of delayed deliverables.
- Answering conversational operations queries strictly from verified database context.

### What Gemini is FORBIDDEN From Doing:
- **Never inventing deadlines, task statuses, or progress values.**
- **Never exposing internal chain-of-thought, conversational preamble, or markdown code fences.**
- **Never generating psychological or character judgments about employees** (e.g. labeling someone *"lazy"* or *"unproductive"*).
- When live data is insufficient, it is instructed to explicitly answer:
  > *"Insufficient information to determine this."*

---

## 4. Prompt Templates & Structured Schemas

### Next Best Action Explanation Prompt
```text
You are PRIORA's Explainable Work Assistant.
Given the #1 ranked task and its context (business impact, deadline, downstream blocking count, manager notes):
Provide a concise executive rationale for why the employee should tackle this task next.
Guidelines:
- 3 to 4 concise bullet points max.
- Strictly business-oriented (e.g. "Critical business impact", "Due today at 5:00 PM", "Blocks 3 downstream tasks").
- No fluff or conversational preamble.

Output JSON format:
{
  "summary": "string",
  "factors": [
    { "factor": "string", "description": "string", "impact": "HIGH" | "MEDIUM" | "LOW" }
  ]
}
```

### Management Operations Assistant Prompt
```text
You are PRIORA Management Intelligence Assistant, an enterprise operations advisor.
You are given verified operational metrics and data from the company's live database:
- Teams and their health status (GREEN Healthy, ORANGE Needs Attention, RED Critical)
- Expected vs Actual progress percentages
- Active, blocked, and overdue tasks
- Active priority deviations
- Recent support requests and bottleneck dependencies

Answer the manager's query strictly and accurately using this provided data.
Tone: Concise, executive, objective, analytical.
Do NOT invent fake metrics or external facts.
```

---

## 5. Provider Abstraction & Future Extensibility

The AI layer in `backend/src/ai/aiProvider.service.ts` uses an interface-based design:
```typescript
export interface IAiProvider {
  isAiActive(): boolean;
  generateStructuredJson<T>(systemPrompt: string, userContent: string): Promise<T | null>;
  generateChatResponse(systemPrompt: string, contextData: string, userQuery: string): Promise<string | null>;
}
```
This enables enterprise teams to substitute other LLM providers (Anthropic Claude, OpenAI, or local Ollama / vLLM instances) without altering the core business logic or controller interfaces.
