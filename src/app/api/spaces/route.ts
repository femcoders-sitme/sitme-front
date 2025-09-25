import { cookies } from 'next/headers';
const BACKEND = process.env.BACKEND_API_URL!;
const COOKIE = process.env.JWT_COOKIE_NAME || 'pt_jwt';

export async function GET() {
  const res = await fetch(`${BACKEND}/api/spaces`, {
    cache: 'no-store',
  });

  const raw = await res.json().catch(() => ({}));
  const data = Array.isArray(raw) ? raw : raw?.data ?? [];

  return new Response(JSON.stringify(data), { status: res.status });
}

export async function POST(req: Request) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });

  const formData = await req.formData();
  const res = await fetch(`${BACKEND}/api/spaces`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), { status: res.status });
}
