import { NextResponse } from 'next/server';
import { getApprovals, resolveApproval } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const approvals = getApprovals(businessId);
  return NextResponse.json({ approvals });
}

export async function POST(req: Request) {
  try {
    const { approvalId, decision, userName = 'Sunil Kumar (Owner)' } = await req.json();

    if (!approvalId || !decision) {
      return NextResponse.json({ error: 'approvalId and decision (Approved/Rejected) are required' }, { status: 400 });
    }

    const resolved = resolveApproval(approvalId, decision, userName);
    if (!resolved) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, approval: resolved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
