import { NextResponse } from 'next/server';
import { seedCategoryWorkspace, getUserOrganizations, updateOrganizationActiveBusiness } from '@/lib/db';
import { BusinessCategoryKey } from '@/lib/types';
import { resolveUserSession, createToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { category, businessName, userId = 'usr-demo-owner', orgId: reqOrgId } = await req.json();

    if (!category) {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }

    let orgId = reqOrgId;
    if (!orgId) {
      const orgs = getUserOrganizations(userId);
      orgId = orgs[0]?.id || 'org-demo-1';
    }

    const business = seedCategoryWorkspace(category as BusinessCategoryKey, orgId, businessName);
    updateOrganizationActiveBusiness(orgId, business.id);

    const updatedSession = resolveUserSession(userId);
    const token = updatedSession ? createToken(updatedSession) : undefined;

    const response = NextResponse.json({
      success: true,
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
