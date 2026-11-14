import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrderStatus, getBusinessById } from '@/lib/db';
import { OrderRecord } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-food-demo';
  const orders = getOrders(businessId);
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessId,
      orderType = 'Dine-in',
      customerName = 'Guest',
      customerMobile,
      tableNumber,
      items = [],
      totalAmount = 0,
      isPaid = false,
      deliveryAddress,
      deliveryTimeSlot,
      notes,
    } = body;

    if (!businessId) return NextResponse.json({ error: 'businessId is required' }, { status: 400 });

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const order: OrderRecord = {
      id: `ord-${Date.now()}`,
      orgId,
      businessId,
      orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
      orderType,
      customerName,
      customerMobile,
      tableNumber,
      status: orderType === 'Laundry' ? 'Received' : 'Preparing',
      items,
      totalAmount: Number(totalAmount),
      isPaid,
      deliveryAddress,
      deliveryTimeSlot,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createOrder(order);
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });

    const updated = updateOrderStatus(id, status);
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
