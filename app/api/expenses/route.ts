import { NextResponse } from 'next/server';
import { getExpenses, addExpense, getBusinessById } from '@/lib/db';
import { Expense } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const expenses = getExpenses(businessId);
  return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessId,
      category = 'Other',
      description,
      amount,
      paymentMethod = 'UPI',
      paidTo,
      recordedBy = 'Owner',
      date,
    } = body;

    if (!businessId || !description || amount === undefined) {
      return NextResponse.json({ error: 'businessId, description, and amount are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      orgId,
      businessId,
      category,
      description,
      amount: Number(amount),
      paymentMethod,
      paidTo: paidTo || undefined,
      recordedBy,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    addExpense(expense);
    return NextResponse.json({ success: true, expense });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
