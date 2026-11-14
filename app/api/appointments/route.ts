import { NextResponse } from 'next/server';
import { getAppointments, createAppointment, getBusinessById } from '@/lib/db';
import { AppointmentRecord } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-salon-demo';
  const appointments = getAppointments(businessId);
  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, customerName, customerMobile, serviceId, serviceName, staffId, staffName, date, timeSlot, price, notes } = body;

    if (!businessId || !customerName || !serviceName) {
      return NextResponse.json({ error: 'businessId, customerName, and serviceName are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const apt: AppointmentRecord = {
      id: `apt-${Date.now()}`,
      orgId,
      businessId,
      customerName,
      customerMobile: customerMobile || '',
      serviceId: serviceId || `srv-${Date.now()}`,
      serviceName,
      staffId: staffId || 'st-default',
      staffName: staffName || 'Floor Stylist',
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '11:00 AM - 12:00 PM',
      status: 'Confirmed',
      price: Number(price) || 0,
      notes,
      createdAt: new Date().toISOString(),
    };

    createAppointment(apt);
    return NextResponse.json({ success: true, appointment: apt });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
