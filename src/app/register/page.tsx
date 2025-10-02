'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string>();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      setErr('Error al registrar');
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="font-sans text-2xl font-semibold mb-4">Registro</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={e=>setUsername(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
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
        <button
          className="rounded-full border border-transparent transition-colors flex items-center justify-center font-medium text-base h-12 px-6 w-full"
          style={{
            backgroundColor: "#E20074",
            color: "white",
          }}
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-pink-600 font-medium hover:underline">
          Log in here
        </a>
      </p>
    </main>
  );
}