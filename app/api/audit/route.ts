import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const logs = getAuditLogs(businessId);
  return NextResponse.json({ logs });
}
