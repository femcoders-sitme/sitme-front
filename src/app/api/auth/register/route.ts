import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

export async function POST(req: NextRequest) {
  const registerPayload = await req.json();

  const res = await fetch(`${BACKEND}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: (data as any)?.message || 'Error al registrar' },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true, ...data }, { status: 200 });
}