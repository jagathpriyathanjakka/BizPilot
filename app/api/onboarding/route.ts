import { NextResponse } from 'next/server';
import {
  createBusiness,
  updateOrganizationActiveBusiness,
  seedCategoryWorkspace,
  getOrganizationById,
  getUserOrganizations,
} from '@/lib/db';
import { BusinessProfile } from '@/lib/types';
import { resolveUserSession, createToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orgId: reqOrgId,
      userId = 'usr-demo-owner',
      businessInfo,
      category,
      businessType,
      additionalTypes = [],
      operations,
      seedDemo = true,
    } = body;

    let orgId = reqOrgId;
    if (!orgId) {
      const orgs = getUserOrganizations(userId);
      orgId = orgs[0]?.id || 'org-demo-1';
    }

    const businessId = `biz-${category}-${Date.now().toString(36)}`;

    const newBusiness: BusinessProfile = {
      id: businessId,
      orgId,
      name: businessInfo.name || 'My Business',
      ownerName: businessInfo.ownerName || 'Business Owner',
      category: category || 'grocery',
      businessType: businessType || 'General Store',
      additionalTypes,
      mobile: businessInfo.mobile || '+91 98765 43210',
      email: businessInfo.email || 'contact@business.com',
      address: businessInfo.address || 'Commercial Market',
      country: businessInfo.country || 'India',
      state: businessInfo.state || 'Maharashtra',
      city: businessInfo.city || 'Mumbai',
      pincode: businessInfo.pincode || '400001',
      registrationNumber: businessInfo.registrationNumber,
      gstin: businessInfo.gstin,
      currency: businessInfo.currency || 'INR',
      timezone: businessInfo.timezone || 'Asia/Kolkata',
      openingDate: businessInfo.openingDate || new Date().toISOString().split('T')[0],
      operations: {
        sellsProducts: operations?.sellsProducts ?? true,
        providesServices: operations?.providesServices ?? false,
        managesInventory: operations?.managesInventory ?? true,
        hasEmployees: operations?.hasEmployees ?? false,
        hasMultipleBranches: operations?.hasMultipleBranches ?? false,
        acceptsCash: operations?.acceptsCash ?? true,
        acceptsUpi: operations?.acceptsUpi ?? true,
        acceptsCards: operations?.acceptsCards ?? true,
        acceptsBankTransfer: operations?.acceptsBankTransfer ?? true,
        offersDelivery: operations?.offersDelivery ?? false,
        openingHours: operations?.openingHours || '09:00 AM - 09:00 PM',
      },
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };

    if (seedDemo) {
      // Seed rich realistic data for the selected category with this business name
      seedCategoryWorkspace(category, orgId, businessInfo.name);
    } else {
      createBusiness(newBusiness);
    }

    updateOrganizationActiveBusiness(orgId, businessId);

    const updatedSession = resolveUserSession(userId);
    const newToken = updatedSession ? createToken(updatedSession) : undefined;

    const response = NextResponse.json({
      success: true,
      business: newBusiness,
      activeBusinessId: businessId,
      session: updatedSession,
    });

    if (newToken) {
      response.cookies.set('bizpilot_token', newToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err: any) {
    console.error('Onboarding submission error:', err);
    return NextResponse.json({ error: err.message || 'Failed to complete onboarding' }, { status: 500 });
  }
}
