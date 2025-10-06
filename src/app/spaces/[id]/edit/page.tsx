'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

export default function EditSpacePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState('ROOM');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    fetch(`${BACKEND}/api/spaces/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name);
        setCapacity(String(data.capacity));
        setType(data.type);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const formData = new FormData();
    formData.append('space', JSON.stringify({ name, capacity: Number(capacity), type }));
    if (file) formData.append('file', file);

    const res = await fetch(`${BACKEND}/api/spaces/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      router.push('/spaces');
    } else {
      setError('Error updating space');
    }
  };

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">Edit Space</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8">
        <input
          type="text"
          placeholder="Space name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full border-b-2 border-gray-300 focus:border-pink-500 outline-none py-2 px-1 text-base"
        />
        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          required
          min={1}
          className="w-full border-b-2 border-gray-300 focus:border-pink-500 outline-none py-2 px-1 text-base"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full border-b-2 border-gray-300 focus:border-pink-500 outline-none py-2 px-1 text-base"
        >
          <option value="ROOM">Room</option>
          <option value="TABLE">Table</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="w-full"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 text-lg shadow transition-all mx-auto block">
          Update
        </button>
      </form>
    </main>
  );
}