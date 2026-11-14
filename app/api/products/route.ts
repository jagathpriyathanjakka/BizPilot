import { NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, deleteProduct, getBusinessById } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const products = getProducts(businessId);
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessId,
      name,
      barcode,
      sku,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      quantity,
      unit,
      minStockLevel = 5,
      expiryDate,
      description,
      attributes = {},
    } = body;

    if (!businessId || !name || sellingPrice === undefined) {
      return NextResponse.json({ error: 'businessId, name, and sellingPrice are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      orgId,
      businessId,
      name,
      barcode: barcode || undefined,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      category: category || 'General',
      brand: brand || undefined,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice),
      quantity: Number(quantity) || 0,
      unit: unit || 'piece',
      minStockLevel: Number(minStockLevel),
      expiryDate: expiryDate || undefined,
      description: description || undefined,
      attributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProduct(newProduct);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 });

    const updated = updateProduct(id, updates);
    if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product id is required' }, { status: 400 });

    const success = deleteProduct(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
