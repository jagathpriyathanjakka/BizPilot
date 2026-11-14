import { NextResponse } from 'next/server';
import { getStaff, addStaff, getBusinessById } from '@/lib/db';
import { StaffMember, UserRole } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId') || 'biz-grocery-demo';
  const staff = getStaff(businessId);
  return NextResponse.json({ staff });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessId,
      name,
      mobile,
      email,
      role = 'sales_staff',
      salary,
      joiningDate,
      permissions,
    } = body;

    if (!businessId || !name || !mobile) {
      return NextResponse.json({ error: 'businessId, name, and mobile are required' }, { status: 400 });
    }

    const business = getBusinessById(businessId);
    const orgId = business?.orgId || 'org-demo-1';

    const defaultPerms = {
      canBill: role === 'cashier' || role === 'owner' || role === 'manager',
      canManageInventory: role === 'inventory_manager' || role === 'owner' || role === 'manager',
      canViewReports: role === 'manager' || role === 'owner' || role === 'admin',
      canManageStaff: role === 'owner' || role === 'admin',
      canApproveActions: role === 'owner' || role === 'admin',
    };

    const staffMember: StaffMember = {
      id: `st-${Date.now()}`,
      orgId,
      businessId,
      name,
      mobile,
      email: email || '',
      role: role as UserRole,
      salary: salary ? Number(salary) : undefined,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      salesCount: 0,
      salesTotal: 0,
      permissions: permissions || defaultPerms,
      createdAt: new Date().toISOString(),
    };

    addStaff(staffMember);
    return NextResponse.json({ success: true, staff: staffMember });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
