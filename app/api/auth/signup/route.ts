import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, createOrganization } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { User, Organization } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { fullName, email, mobile, password } = await req.json();

    if (!fullName || !email || !password || !mobile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (findUserByEmail(email)) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr-${Date.now()}`;

    const newUser: User = {
      id: userId,
      email,
      fullName,
      mobile,
      passwordHash,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    createUser(newUser);

    // Create default organization
    const orgId = `org-${Date.now()}`;
    const newOrg: Organization = {
      id: orgId,
      name: `${fullName}'s Business Group`,
      ownerId: userId,
      currency: 'INR',
      country: 'India',
      activeBusinessId: '',
      createdAt: new Date().toISOString(),
    };
    createOrganization(newOrg);

    const session = {
      userId,
      email,
      fullName,
      role: 'owner',
      orgId,
      activeBusinessId: '',
      onboardingComplete: false,
    };

    const token = createToken(session);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        mobile: newUser.mobile,
        role: newUser.role,
      },
      session,
      token,
    });

    response.cookies.set('bizpilot_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.error('Sign-up error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
