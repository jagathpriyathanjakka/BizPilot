import { NextResponse } from 'next/server';
import { findUserByEmail, getUserOrganizations, getBusinessById } from '@/lib/db';
import { verifyPassword, createToken, resolveUserSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { emailOrMobile, password } = await req.json();

    if (!emailOrMobile || !password) {
      return NextResponse.json({ error: 'Email/Mobile and password are required' }, { status: 400 });
    }

    // Default demo fallback shortcut for testing
    let user = findUserByEmail(emailOrMobile);
    if (!user && (emailOrMobile === 'owner@bizpilot.ai' || emailOrMobile === 'admin' || emailOrMobile === 'demo')) {
      user = findUserByEmail('owner@bizpilot.ai');
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password. Please check and try again.' }, { status: 401 });
    }

    const session = resolveUserSession(user.id);
    if (!session) {
      return NextResponse.json({ error: 'Failed to establish user organization context' }, { status: 500 });
    }

    const token = createToken(session);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mobile: user.mobile,
      },
      session,
      token,
    });

    response.cookies.set('bizpilot_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Sign-in error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
