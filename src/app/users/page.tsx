'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

type User = {
  id: number;
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '' });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [inputKey, setInputKey] = useState(Date.now());

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${BACKEND}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error deleting user');
      setUsers(users => users.filter(u => u.id !== id));
    } catch {
      alert('Error deleting user');
    } finally {
      setDeletingId(null);
    }
  };

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
          {filtered.map(u => (
            <li
              key={u.id}
              className="border rounded-2xl p-4 bg-white shadow hover:shadow-lg transition flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                {u.imageUrl ? (
                  <img
                    src={u.imageUrl}
                    alt={u.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                    {u.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-lg">{u.username}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {u.role}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deletingId === u.id}
                    className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition disabled:opacity-50"
                    title="Delete user"
                  >
                    {deletingId === u.id ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setEditForm({
                        username: u.username || '',
                        email: u.email || '',
                        password: ''
                      });
                      setEditImage(null);
                      setInputKey(Date.now());
                    }}
                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-pink-100 hover:text-pink-700 transition"
                    title="Update user"
                  >
                    Update
                  </button>
                </div>
              </div>
            </li>
          ))}
          {editingUser && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-4">Update User</h2>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const formData = new FormData();
                    const userPayload: any = {
                      username: editForm.username || editingUser?.username,
                      email: editForm.email || editingUser?.email,
                    };
                    if (editForm.password && editForm.password.trim() !== "") userPayload.password = editForm.password;
                    const userBlob = new Blob([JSON.stringify(userPayload)], { type: "application/json" });
                    formData.append("user", userBlob, "user.json");
                    if (editImage) formData.append("file", editImage);

                    try {
                      const res = await fetch(`${BACKEND}/api/users/${editingUser.id}`, {
                        method: "PUT",
                        body: formData,
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) throw new Error('Error updating user');
                      const updated = await res.json();
                      setUsers(users =>
                        users.map(u =>
                          u.id === editingUser.id
                            ? { ...u, ...updated.data }
                            : u
                        )
                      );
                      setEditingUser(null);
                      setEditImage(null);
                      setInputKey(Date.now());
                    } catch (err) {
                      alert('Error updating user');
                    }
                  }}
                  className="space-y-4 w-full"
                >
                  <div>
                    <label className="block font-medium">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Password (optional)</label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Imagen de perfil</label>
                    {editImage ? (
                      <img
                        src={URL.createObjectURL(editImage)}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow"
                      />
                    ) : editingUser?.imageUrl ? (
                      <img
                        src={editingUser.imageUrl}
                        alt={editingUser.username}
                        className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 shadow">
                        {editingUser?.username[0].toUpperCase()}
                      </div>
                    )}
                    <input
                      key={inputKey}
                      type="file"
                      accept="image/*"
                      onChange={e => setEditImage(e.target.files?.[0] || null)}
                      className="w-full border rounded p-2 mt-2"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 shadow transition-all"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setEditImage(null);
                        setInputKey(Date.now());
                      }}
                      className="rounded-full bg-gray-400 text-white font-bold py-2 px-6 shadow transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </ul>
      )}
    </main>
  );
}