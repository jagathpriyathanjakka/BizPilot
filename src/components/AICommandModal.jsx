import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Clock,
  Receipt,
  FileText,
} from 'lucide-react';
import { api } from '../api';

export const AICommandModal = ({
  isOpen,
  onClose,
  businessId,
  categoryKey = 'grocery',
  onActionApproved,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am BizPilot Orchestrator, coordinating 6 intelligent agents across Inventory, Sales, Financials, and Operations. Ask me anything about your business or pick a prompt below.',
    },
  ]);

  if (!isOpen) return null;

  const promptSuggestions = {
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
  };

  const suggestions = promptSuggestions[categoryKey] || promptSuggestions.grocery;

  const handleSend = async (userText) => {
    const textToSend = userText || query;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.queryAI(textToSend, businessId);
      setMessages((prev) => [...prev, { role: 'assistant', result: res }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error running query: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (approvalId) => {
    try {
      await api.resolveApproval(approvalId, 'approve');
      alert('Action approved and executed by Central Orchestrator!');
      onActionApproved?.();
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/80 bg-[#070B14]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 flex items-center justify-center">
              <div className="h-full w-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Central AI Orchestrator
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Autonomous Multi-Agent
                </span>
              </h2>
              <p className="text-xs text-slate-400">Inventory, Sales, Pricing, Marketing & Scheduling Agents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[500px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                  m.role === 'user'
                    ? 'bg-violet-600 text-white shadow-glow'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-card'
                }`}
              >
                {m.content && <p className="leading-relaxed">{m.content}</p>}

                {m.result && (
                  <div className="space-y-3">
                    {/* Active agents pills */}
                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
                      {m.result.activeAgents.map((ag) => (
                        <span
                          key={ag}
                          className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[10px] border border-violet-500/30"
                        >
                          ⚡ {ag}
                        </span>
                      ))}
                    </div>

                    <p className="font-semibold text-white leading-relaxed">
                      {m.result.orchestratorSummary}
                    </p>

                    {/* Findings */}
                    {m.result.findings && m.result.findings.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {m.result.findings.map((f, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-slate-850 border border-slate-800 text-[11px] flex items-start gap-2"
                          >
                            <span className="font-bold text-cyan-400 shrink-0">[{f.category}]</span>
                            <span className="text-slate-300">{f.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table Data Preview */}
                    {m.result.tableData && (
                      <div className="overflow-x-auto rounded-lg border border-slate-800 my-2">
                        <table className="w-full text-[10px] text-left">
                          <thead className="bg-slate-800/80 text-slate-400">
                            <tr>
                              {m.result.tableData.headers.map((h, i) => (
                                <th key={i} className="p-1.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {m.result.tableData.rows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-800/40">
                                {r.map((cell, j) => (
                                  <td key={j} className="p-1.5 text-slate-200">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Suggested Action Requiring Owner Approval */}
                    {m.result.suggestedAction && m.result.suggestedAction.requiresApproval && (
                      <div className="mt-2 p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <ShieldAlert className="h-4 w-4" />
                          <span>Owner Authorization Required</span>
                        </div>
                        <p className="font-semibold text-white text-xs">{m.result.suggestedAction.title}</p>
                        <p className="text-[11px] text-slate-300">{m.result.suggestedAction.description}</p>
                        {m.result.suggestedAction.approvalId && (
                          <button
                            onClick={() => handleApproveAction(m.result.suggestedAction.approvalId)}
                            className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Approve & Execute Action</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 animate-pulse w-fit">
              <Bot className="h-4 w-4 text-cyan-400 animate-spin" />
              <span>Agents collaborating: reading SQLite data & synthesizing actions...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Prompts:</span>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-violet-600/20 hover:border-violet-500/40 border border-slate-700/60 text-slate-300 hover:text-white shrink-0 transition-colors text-[11px]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI anything (e.g. 'How much did I sell today?')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
          <button
            disabled={!query.trim() || loading}
            onClick={() => handleSend()}
            className="h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white flex items-center justify-center shadow-glow transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICommandModal;
