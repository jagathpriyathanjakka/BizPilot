import { NextResponse } from 'next/server';
import { getSuppliers, addSupplier, getBusinessById } from '@/lib/db';
import { Supplier } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const suppliers = getSuppliers(businessId);
  return NextResponse.json({ suppliers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, name, companyName, mobile, email, address, gstin, paymentTerms, productsSupplied = [] } = body;

    if (!businessId || !name || !mobile) {
      return NextResponse.json({ error: 'businessId, name, and mobile are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      orgId,
      businessId,
      name,
      companyName: companyName || name,
      mobile,
      email: email || undefined,
      address: address || undefined,
      gstin: gstin || undefined,
      paymentTerms: paymentTerms || 'Net 15 Days',
      productsSupplied,
      rating: 4.8,
      balanceOwed: 0,
      createdAt: new Date().toISOString(),
    };

    addSupplier(supplier);
    return NextResponse.json({ success: true, supplier });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
