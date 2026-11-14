import { NextResponse } from 'next/server';
import { executeMultiAgentQuery } from '@/lib/agents/orchestrator';

export async function POST(req: Request) {
  try {
    const { businessId, query, userId = 'Owner' } = await req.json();

    if (!businessId || !query) {
      return NextResponse.json({ error: 'businessId and query are required' }, { status: 400 });
    }

    const result = await executeMultiAgentQuery(businessId, query, userId);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('AI Command Center query error:', err);
    return NextResponse.json({ error: err.message || 'AI Orchestrator failed to process query' }, { status: 500 });
  }
}
