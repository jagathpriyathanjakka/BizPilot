'use client';

import React, { useState, useEffect } from 'react';
import {
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
  User,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { BusinessProfile } from '@/lib/types';
import { AgentExecutionResult } from '@/lib/agents/orchestrator';
import { BUSINESS_CATEGORIES } from '@/lib/categories-config';

export default function AIPage() {
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
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
        'Welcome to BizPilot AI Command Center! I coordinate 8 autonomous agents (Inventory Intelligence, Sales Intelligence, Financial Intelligence, Supplier Coordination, Billing, Operations, and Audit) to answer business questions, plan restocks, and generate financial insights with deterministic accuracy. How can I assist you today?',
    },
  ]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        body: JSON.stringify({
          businessId: business?.id || 'biz-grocery-demo',
          query: userMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', result: data.result }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${data.error || 'Failed to process'}` },
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

  const handleApproveAction = async () => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId: 'appr-latest', decision: 'Approved' }),
      });
      const data = await res.json();
      alert('Action approved and recorded in the audit log!');
    } catch (err) {
      alert('Approval error');
    }
  };

  const categoryKey = business?.category || 'grocery';
  const samplePrompts = [
    'How much did I sell today?',
    'Show this month’s profit and gross margin',
    'Which products are running low on stock?',
    'How much money do customers owe me?',
    'Prepare a restocking plan for low-stock items',
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar currentBusiness={business || undefined} />

      <div className="flex-1 flex">
        <Sidebar currentBusiness={business || undefined} className="hidden md:flex" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col justify-between space-y-4">
          <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
                <div className="h-full w-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="h-5 w-5 text-cyan-300" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">AI Command Center</h1>
                <p className="text-xs text-slate-400">
                  Natural Language Business Intelligence & Multi-Agent Orchestration
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>8 Agents Standby</span>
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[60vh] min-h-[400px]">
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
                      <div className="rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
                        {m.content}
                      </div>
                    )}

                    {m.result && (
                      <div className="rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
                        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">
                            Agents Assigned:
                          </span>
                          {m.result.activeAgents.map((ag) => (
                            <span
                              key={ag}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-700 text-cyan-300"
                            >
                              {ag}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs font-medium text-slate-200 leading-relaxed">
                          {m.result.orchestratorSummary}
                        </p>

                        <div className="space-y-1.5">
                          {m.result.findings.map((f, fIdx) => (
                            <div
                              key={fIdx}
                              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-slate-200">{f.category}: </span>
                                <span>{f.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {m.result.tableData && (
                          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
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

                        {m.result.suggestedAction && (
                          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                              <ShieldAlert className="h-4 w-4" />
                              <span>Action Prepared (Requires Explicit Authorization)</span>
                            </div>
                            <p className="text-xs font-semibold text-white">
                              {m.result.suggestedAction.title}
                            </p>
                            <p className="text-[11px] text-slate-300">
                              {m.result.suggestedAction.description}
                            </p>
                            <div className="pt-2 flex justify-end gap-2">
                              <button
                                onClick={() => alert('Action dismissed')}
                                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-[11px] text-slate-300"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={handleApproveAction}
                                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]"
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
              <div className="flex items-center gap-2 text-xs text-slate-400 p-3 rounded-xl border border-slate-800 bg-slate-900/60 w-fit">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Assigning tasks to agents & compiling database metrics...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] text-slate-500 font-semibold shrink-0">Suggestions:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-violet-500/40 hover:text-violet-300 text-slate-300 transition-colors shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your business..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-glow transition-all active:scale-95 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Ask AI</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
