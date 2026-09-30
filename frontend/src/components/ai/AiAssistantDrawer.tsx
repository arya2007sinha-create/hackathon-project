import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, Database, ArrowRight } from 'lucide-react';
import { aiApi, AiAssistantResponse } from '../../api/ai.api';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Which teams need attention today?',
  'Why is Operations behind?',
  'Which tasks are blocking other work?',
  'Which employees currently need support?',
  'Which deadlines are at risk?',
  'Why did Payment API become priority #1?',
];

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; source?: string; suggestedAction?: string }>>([
    {
      sender: 'ai',
      text: 'Good day. I am PRIORA Management Intelligence. I evaluate real-time telemetry across Northstar Technologies to answer operational queries regarding team health, bottlenecks, and execution priorities.',
      source: 'OPERATIONAL_ENGINE',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setQuery('');
    setIsLoading(true);

    try {
      const result: AiAssistantResponse = await aiApi.askAssistant(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: result.answer,
          source: result.source === 'GEMINI_AI' ? 'Gemini 1.5 Flash' : 'Deterministic Operations Engine',
          suggestedAction: result.suggestedAction,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to process query at this time. Live system telemetry remains accessible via the operations dashboard.',
          source: 'System Fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-primary/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-modal flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary">Management AI Assistant</h3>
                <p className="text-[11px] text-secondary flex items-center gap-1">
                  <Database className="w-3 h-3 text-status-healthy" />
                  <span>Verified live database grounding</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-secondary hover:text-primary rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-3 bg-slate-50 border-b border-border overflow-x-auto">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-2">
              Suggested Operational Queries
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-border text-primary hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                    P
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-slate-50 border border-border text-primary rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.source && (
                    <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-secondary">
                      <span>Source: {m.source}</span>
                    </div>
                  )}
                  {m.suggestedAction && (
                    <div className="mt-2 p-2 bg-accent/5 rounded-lg border border-accent/20 text-accent font-medium">
                      Recommended Action: {m.suggestedAction}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-secondary">
                <div className="w-6 h-6 rounded-md bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                  P
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-3 rounded-2xl border border-border">
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Query Input */}
          <div className="p-4 border-t border-border bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about team health, bottlenecks, or tasks..."
                className="flex-1 text-xs p-2.5 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="p-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
