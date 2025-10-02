'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

type User = {
  username: string;
  email: string;
  role: string;
  imageUrl?: string;
};

export default function UsersPage() {
  const { token, role } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (role !== 'ADMIN') {
      setError('Access denied');
      return;
    }

    fetch(`${BACKEND}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Error fetching users');
        return res.json();
      })
      .then(data => {
        setUsers(data.data || []);
      })
      .catch(() => setError('Error fetching users'));
  }, [token, role]);

  if (error) return <p className="text-red-600 p-6">{error}</p>;

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      <input
        type="text"
        placeholder="Search by username or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 w-full border rounded px-3 py-2"
      />

      {filtered.length === 0 ? (
        <p>No users found matching the search.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((u, i) => (
            <li
              key={i}
              className="border rounded p-4 bg-white shadow hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                {u.imageUrl ? (
                  <img
                    src={u.imageUrl}
                    alt={u.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {u.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{u.username}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
