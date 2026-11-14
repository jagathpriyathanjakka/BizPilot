import { NextResponse } from 'next/server';
import { getSales, createSale, getBusinessById, getProducts } from '@/lib/db';
import { Sale, SaleItem } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const sales = getSales(businessId);
  return NextResponse.json({ sales });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessId,
      customerId,
      customerName = 'Walk-in Customer',
      customerMobile,
      items,
      discountAmount = 0,
      taxRate = 0,
      paymentMethod = 'Cash',
      paymentStatus = 'Paid',
      amountReceived,
      staffName = 'Owner',
      notes,
    } = body;

    if (!businessId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'businessId and at least one item are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';
    const storeProducts = getProducts(businessId);

    // Calculate subtotal, COGS, tax deterministically
    let subtotal = 0;
    let costOfGoodsSold = 0;

    const validatedItems: SaleItem[] = items.map((i: any) => {
      const unitPrice = Number(i.unitPrice) || 0;
      const quantity = Number(i.quantity) || 1;
      const discount = Number(i.discount) || 0;
      const prod = i.productId ? storeProducts.find((p) => p.id === i.productId) : null;
      const purchaseCost = prod ? prod.purchasePrice : Number(i.purchaseCost) || 0;

      const itemTotal = unitPrice * quantity - discount;
      subtotal += itemTotal;
      costOfGoodsSold += purchaseCost * quantity;

      return {
        productId: i.productId,
        name: i.name || (prod ? prod.name : 'Custom Item'),
        sku: prod ? prod.sku : undefined,
        quantity,
        unitPrice,
        purchaseCost,
        discount,
        taxRate: Number(taxRate) || 0,
        taxAmount: (itemTotal * (Number(taxRate) || 0)) / 100,
        total: itemTotal,
        attributes: i.attributes || {},
      };
    });

    const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
    const totalAmount = Math.max(0, subtotal + taxAmount - Number(discountAmount));
    const grossProfit = totalAmount - costOfGoodsSold;

    const received = amountReceived !== undefined ? Number(amountReceived) : totalAmount;
    const finalPaymentStatus = received >= totalAmount ? 'Paid' : received > 0 ? 'Partial' : 'Pending';

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      orgId,
      businessId,
      invoiceNumber,
      customerId: customerId || undefined,
      customerName,
      customerMobile: customerMobile || undefined,
      items: validatedItems,
      subtotal,
      discountAmount: Number(discountAmount),
      taxAmount,
      totalAmount,
      costOfGoodsSold,
      grossProfit,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      amountReceived: received,
      staffName,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    createSale(sale);
    return NextResponse.json({ success: true, sale });
  } catch (err: any) {
    console.error('Create sale error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
