// app/api/auth/login/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL!;
const COOKIE = process.env.JWT_COOKIE_NAME || 'pt_jwt';

export async function POST(req: NextRequest) {
  const loginPayload = await req.json();

  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginPayload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: (data as any)?.message || 'Invalid credentials' },
      { status: res.status }
    );
  }

  const token = (data as any)?.data?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ error: 'Token not found in response' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, ...data }, { status: 200 });
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 4, // 4h
  });
  return response;
}
