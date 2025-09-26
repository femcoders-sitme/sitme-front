// app/api/reservations/route.ts
import { cookies } from 'next/headers';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
const COOKIE = process.env.JWT_COOKIE_NAME || 'pt_jwt';

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value;

  const res = await fetch(`${BACKEND}/api/reservations`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  const raw = await res.json().catch(() => ({}));
  const data = raw?.data ?? [];

  return new Response(JSON.stringify(data), { status: res.status });
}

export async function POST(req: Request) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await req.json();
  const res = await fetch(`${BACKEND}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), { status: res.status });
}
