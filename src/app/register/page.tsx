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
    <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-left">
          <span className="text-pink-600">Register</span> to SitMe
        </h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Username</label>
            <input
              className="w-full border-b-2 border-gray-300 focus:border-pink-500 outline-none bg-transparent py-2 px-1 text-base transition-all"
              placeholder="Enter your username"
              value={username}
              onChange={e=>setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Email</label>
            <input
              className="w-full border-b-2 border-gray-300 focus:border-pink-500 outline-none bg-transparent py-2 px-1 text-base transition-all"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Password</label>
            <input
              className="w-full border-b-2 border-gray-300 focus:border-pink-500 outline-none bg-transparent py-2 px-1 text-base pr-10 transition-all"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-8 text-lg text-gray-400 hover:text-pink-600"
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button
            className="w-full rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 text-lg shadow transition-all"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-pink-600 font-semibold hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </main>
  );
}