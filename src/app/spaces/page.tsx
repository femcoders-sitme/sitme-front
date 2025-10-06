'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

type Space = {
  id: number;
  name: string;
  capacity: number;
  type: string;
  imageUrl?: string;
};

export default function SpacesPage() {
  const { token } = useAuth();
  const { role } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<'ALL' | 'ROOM' | 'TABLE'>('ALL');

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

  const isAdmin =
    Array.isArray(role)
      ? role.includes("ROLE_ADMIN")
      : role?.replace(/[\[\]]/g, "").includes("ADMIN");

  return (
    <main className="p-6 bg-gradient-to-br from-pink-50 to-white">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-8 text-center">
        Find your <span className="text-pink-600">space</span>
      </h1>
      <div className="flex gap-2 mb-8 justify-center">
        {['ALL', 'ROOM', 'TABLE'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border shadow transition-all duration-150 ${
              filter === f
                ? 'bg-pink-600 text-white border-pink-600 scale-105'
                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-pink-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'ROOM' ? 'Rooms' : 'Tables'}
          </button>
        ))}
      </div>
      {isAdmin && (
        <div className="mb-8 flex justify-end">
          <Link
            href="/spaces/create"
            className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 shadow transition-all"
          >
            + Create Space
          </Link>
        </div>
      )}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map(space => (
          <div
            key={space.id}
            className="relative rounded-2xl shadow-xl overflow-hidden flex flex-col justify-end min-h-[320px] border border-gray-200 bg-white"
            style={{
              background: space.imageUrl
                ? `linear-gradient(180deg, rgba(255,255,255,0.7) 60%, rgba(226,0,116,0.08) 100%), url(${space.imageUrl}) center/cover`
                : undefined,
            }}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full shadow ${
                  space.type === 'ROOM'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {space.type}
              </span>
              {isAdmin && (
                <Link
                  href={`/spaces/${space.id}/edit`}
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shadow hover:bg-pink-100 hover:text-pink-700 transition"
                  title="Edit space"
                >
                  Edit
                </Link>
              )}
              {isAdmin && (
              <button
                onClick={async () => {
                  if (window.confirm(`Delete space "${space.name}"?`)) {
                    await fetch(`${BACKEND}/api/spaces/${space.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setSpaces(spaces => spaces.filter(s => s.id !== space.id));
                  }
                }}
                className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold shadow hover:bg-red-200 transition ml-2"
                title="Delete space"
              >
                Delete
              </button>
            )}
            </div>
            <div className="relative z-10 p-6 flex flex-col gap-2">
              <div className="font-extrabold text-xl text-gray-900 drop-shadow">{space.name}</div>
              <div className="text-md text-gray-700 font-medium mb-2 drop-shadow">
                Capacity: <span className="font-bold">{space.capacity}</span>
              </div>
              <Link
                href={`/spaces/${space.id}`}
                className="w-auto rounded-full border border-transparent transition-colors flex items-center justify-center font-bold text-base h-10 px-6 mt-4 shadow-lg mx-auto"
                style={{
                  backgroundColor: "#E20074",
                  color: "white",
                }}
              >
                {isAdmin ? "Check this space" : "Make a Reservation"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}