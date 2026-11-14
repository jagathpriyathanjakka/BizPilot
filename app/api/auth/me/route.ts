import { NextResponse } from 'next/server';
import { verifyToken, resolveUserSession } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie') || '';
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const match = cookieHeader.match(/bizpilot_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      // Fallback: If not logged in, return default demo owner for instant access
      const defaultSession = resolveUserSession('usr-demo-owner');
      return NextResponse.json({ authenticated: false, session: defaultSession });
    }

    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json({ authenticated: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    // Refresh dynamic state
    const currentSession = resolveUserSession(verified.userId) || verified;
    return NextResponse.json({ authenticated: true, session: currentSession });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
