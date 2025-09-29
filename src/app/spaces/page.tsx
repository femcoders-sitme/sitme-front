'use client';
import { useEffect, useState } from 'react';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<'ALL' | 'ROOM' | 'TABLE'>('ALL');

  type Space = {
    name: string;
    capacity: number;
    type: string;
    imageUrl?: string;
  };

  const fetchSpaces = async (f: typeof filter) => {
    let url = `${BACKEND}/api/spaces`;
    if (f === 'ROOM') url = `${BACKEND}/api/spaces/filter/type?type=ROOM`;
    if (f === 'TABLE') url = `${BACKEND}/api/spaces/filter/type?type=TABLE`;

    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Error cargando espacios');
        const data = await res.json();
        setSpaces(data);
    } catch {
        setError('No se pudieron cargar los espacios');
    }
  };

  useEffect(() => {
    fetchSpaces(filter);
  }, [filter]);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Spaces</h1>
      <div className="flex gap-2 mb-4">
        {['ALL', 'ROOM', 'TABLE'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          >
            {f === 'ALL'
              ? 'All'
              : f === 'ROOM' 
              ? 'Rooms'
              : 'Tables'}
          </button>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space, index) => (
            <div key={index} className="border p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-lg">{space.name}</div>
                <div className="flex gap-2">
                <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    space.type === 'ROOM'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {space.type}
                </span>
                </div>
            </div>

            <div className="text-sm opacity-70 mb-2">
                Capacidad: {space.capacity}
            </div>

            {space.imageUrl && (
                <img
                src={space.imageUrl}
                alt={space.name}
                className="mt-2 rounded max-h-40 object-cover"
                />
            )}
            </div>
        ))}
      </div>
    </main>
  );
}
