import { NextResponse } from 'next/server';
import {
  getBusinessesByOrg,
  getBusinessById,
  updateOrganizationActiveBusiness,
  seedCategoryWorkspace,
  getUserOrganizations,
} from '@/lib/db';
import { resolveUserSession, createToken } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || 'org-demo-1';
  const businesses = getBusinessesByOrg(orgId);
  return NextResponse.json({ businesses });
}

export async function POST(req: Request) {
  try {
    const { orgId, name, category, businessType } = await req.json();
    if (!name || !category) {
      return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
    }

    const newBiz = seedCategoryWorkspace(category, orgId || 'org-demo-1', name);
    return NextResponse.json({ success: true, business: newBiz });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { orgId, businessId, userId = 'usr-demo-owner' } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    const targetOrgId = orgId || 'org-demo-1';
    updateOrganizationActiveBusiness(targetOrgId, businessId);

    const business = getBusinessById(businessId);
    const updatedSession = resolveUserSession(userId);
    const token = updatedSession ? createToken(updatedSession) : undefined;

    const response = NextResponse.json({
      success: true,
      activeBusinessId: businessId,
      business,
      session: updatedSession,
    });

    if (token) {
      response.cookies.set('bizpilot_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
