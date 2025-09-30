'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string>();
  const router = useRouter();
  const next = useSearchParams().get('next') || '/spaces';
  const { login } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ identifier: id, password }),
    });

    const data = await res.json();
    if (res.ok) {
      const token = data?.data?.token;
      if (token) login(token);
      router.push(next);
    } else {
      setErr('Login incorrecto');
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="font-sans text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Username o Email"
          value={id}
          onChange={e=>setId(e.target.value)}
        />

        <div className="relative">
          <input
            className="w-full border p-2 rounded pr-10"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-pink-600"
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button className="w-full border p-2 rounded hover:bg-gray-50">Entrar</button>
      </form>
    </main>
  );
}
