'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  FileText,
} from 'lucide-react';
import { BusinessCategoryKey } from '@/lib/types';
import { AgentExecutionResult } from '@/lib/agents/orchestrator';

interface AICommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  categoryKey: BusinessCategoryKey;
  onActionApproved?: () => void;
}

export const AICommandModal: React.FC<AICommandModalProps> = ({
  isOpen,
  onClose,
  businessId,
  categoryKey,
  onActionApproved,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      content?: string;
      result?: AgentExecutionResult;
    }>
  >([
    {
      role: 'assistant',
      content:
        'Hello! I am BizPilot Orchestrator, coordinating 8 intelligent agents across Inventory, Sales, Financials, and Operations. Ask me anything about your business or pick a prompt below.',
    },
  ]);

  if (!isOpen) return null;

  // Domain-specific prompt chips
  const promptSuggestions: Record<BusinessCategoryKey, string[]> = {
    grocery: [
      'Show products that are almost out of stock',
      'Which products have expiry dates soon?',
      'How much did I sell today?',
      'Show this month’s profit and margins',
    ],
    food: [
      'Which ingredients need restocking?',
      'Show today’s sales and open table orders',
      'Show this month’s profit',
      'How much money do customers owe me?',
    ],
    clothing: [
      'Which sizes and designs are selling fastest?',
      'Show products running low on stock',
      'Show this month’s profit',
      'Prepare a restocking plan',
    ],
    medical: [
      'Which medicines are near expiry in the next 60 days?',
      'Show stock alerts and Schedule H count',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    salon: [
      'Show today’s scheduled appointments',
      'How much did I sell today?',
      'Show this month’s profit',
      'Which stylists have the most bookings?',
    ],
    electronics: [
      'How many devices are currently in repair?',
      'Show products with low stock',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    hardware: [
      'Which cables and fittings are running low?',
      'How much money do contractor customers owe me?',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    agriculture: [
      'Show certified seed batches and fertilizer stock',
      'How much money do farmer customers owe me?',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    stationery: [
      'How much did printing services earn this week?',
      'Show pending xerox and bind jobs',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    travel: [
      'Show bookings with pending payments',
      'Show upcoming tour departures',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    furniture: [
      'Show custom woodwork orders in progress',
      'Which items are pending delivery?',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    footwear: [
      'Which shoe sizes are selling fastest?',
      'Show pairs running low in stock',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
    laundry: [
      'How many clothes are in the laundry pipeline?',
      'Show orders ready for delivery',
      'How much did I sell today?',
      'Show this month’s profit',
    ],
  };

  const currentPrompts = promptSuggestions[categoryKey] || promptSuggestions.grocery;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = q;
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, query: userMsg }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', result: data.result }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error || 'Failed to analyze'}` },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Network error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (approvalId?: string) => {
    if (!approvalId) return;
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, decision: 'Approved' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Action authorized and executed successfully by Central Orchestrator!');
        onActionApproved?.();
      }
    } catch (err: any) {
      alert(err.message || 'Approval error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[85vh] rounded-2xl border border-slate-800 bg-navy-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-navy-950/70">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="h-full w-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Command Center</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Autonomous Multi-Agent
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic calculation engine with Human-in-the-Loop approvals
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs text-white shadow-md">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[95%] space-y-3">
                  {m.content && (
                    <div className="rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-200">
                      {m.content}
                    </div>
                  )}

                  {m.result && (
                    <div className="rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-950/90 p-4 space-y-3 shadow-xl">
                      {/* Active agents pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800/80">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Active Agents:
                        </span>
                        {m.result.activeAgents.map((ag) => (
                          <span
                            key={ag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 border border-slate-700 text-cyan-300"
                          >
                            {ag}
                          </span>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="text-xs font-medium text-slate-200 leading-relaxed">
                        {m.result.orchestratorSummary}
                      </div>

                      {/* Findings list */}
                      <div className="space-y-1.5">
                        {m.result.findings.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-slate-200">{f.category}: </span>
                              <span>{f.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Table data if present */}
                      {m.result.tableData && (
                        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/40 mt-2">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                              <tr>
                                {m.result.tableData.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="px-3 py-2">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {m.result.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-800/30">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-3 py-2">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Suggested Action Card requiring approval */}
                      {m.result.suggestedAction && (
                        <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2 mt-2">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                            <ShieldAlert className="h-4 w-4" />
                            <span>Action Awaiting Owner Approval</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200">
                            {m.result.suggestedAction.title}
                          </p>
                          <p className="text-[11px] text-slate-300">
                            {m.result.suggestedAction.description}
                          </p>
                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              onClick={() => alert('Action dismissed')}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveAction('appr-latest')}
                              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[11px] font-bold text-slate-950 transition-colors"
                            >
                              Authorize & Execute
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-xl border border-slate-800 bg-slate-950/60 w-fit">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Coordinating agents & querying real database records...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-navy-950/40 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-semibold shrink-0">Try:</span>
          {currentPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/80 hover:border-violet-500/40 hover:text-violet-300 text-slate-300 transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-navy-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'How much did I sell today?', 'Which products are running low?')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
