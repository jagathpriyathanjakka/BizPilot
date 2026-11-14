import { NextResponse } from 'next/server';
import { getCustomers, addCustomer, getBusinessById } from '@/lib/db';
import { Customer } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const customers = getCustomers(businessId);
  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, name, mobile, email, address, gstNumber, notes, tags = [] } = body;

    if (!businessId || !name || !mobile) {
      return NextResponse.json({ error: 'businessId, name, and mobile are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const customer: Customer = {
      id: `cust-${Date.now()}`,
      orgId,
      businessId,
      name,
      mobile,
      email: email || undefined,
      address: address || undefined,
      gstNumber: gstNumber || undefined,
      totalSpent: 0,
      outstandingBalance: 0,
      tags,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    addCustomer(customer);
    return NextResponse.json({ success: true, customer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
