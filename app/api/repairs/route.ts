import { NextResponse } from 'next/server';
import { getRepairTickets, createRepairTicket, updateRepairStatus, getBusinessById } from '@/lib/db';
import { RepairTicketRecord } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-electronics-demo';
  const repairs = getRepairTickets(businessId);
  return NextResponse.json({ repairs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessId,
      customerName,
      customerMobile,
      deviceType = 'Smartphone',
      brandModel,
      imeiOrSerial = '',
      issueDescription,
      estimatedCost = 0,
      technicianNotes,
    } = body;

    if (!businessId || !customerName || !brandModel || !issueDescription) {
      return NextResponse.json({ error: 'businessId, customerName, device model, and issue are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const ticket: RepairTicketRecord = {
      id: `rep-${Date.now()}`,
      orgId,
      businessId,
      ticketNumber: `TKT-${Date.now().toString().slice(-4)}`,
      customerName,
      customerMobile,
      deviceType,
      brandModel,
      imeiOrSerial,
      issueDescription,
      estimatedCost: Number(estimatedCost),
      status: 'Received',
      technicianNotes,
      receivedDate: new Date().toISOString().split('T')[0],
    };

    createRepairTicket(ticket);
    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });

    const updated = updateRepairStatus(id, status);
    if (!updated) return NextResponse.json({ error: 'Repair ticket not found' }, { status: 404 });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
