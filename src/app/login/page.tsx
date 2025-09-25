'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>();
  const router = useRouter();
  const next = useSearchParams().get('next') || '/spaces';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ identifier: id, password }),
    });
    if (res.ok) router.push(next);
    else setErr('Login incorrecto');
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">SitMe – Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Username o Email"
               value={id} onChange={e=>setId(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full border p-2 rounded hover:bg-gray-50">Entrar</button>
      </form>
    </main>
  );
}
