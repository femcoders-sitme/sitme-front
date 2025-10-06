'use client';

import { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

type Reservation = {
  id: number;
  reservationDate: string;
  timeSlot: string;
  status: string;
  emailSent: boolean;
  createdAt: string;
  userId: number;
  username: string;
  spaceId: number;
  spaceName: string;
};

type Space = {
  id: number;
  name: string;
  imageUrl?: string;
};

type User = {
  username: string;
  imageUrl?: string;
};

const tabs: Array<'ACTIVE' | 'COMPLETED' | 'CANCELLED'> = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

export default function ReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [search, setSearch] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [res1, res2, res3] = await Promise.all([
        fetch(`${BACKEND}/api/reservations`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
        fetch(`${BACKEND}/api/spaces`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
        fetch(`${BACKEND}/api/users`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
      ]);

      const [reservationsData, spacesData, usersData] = await Promise.all([
        res1.json(),
        res2.json(),
        res3.json(),
      ]);

      setReservations(Array.isArray(reservationsData.data) ? reservationsData.data : reservationsData);
      setSpaces(Array.isArray(spacesData) ? spacesData : spacesData.data || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);

    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Error loading reservations data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (token) fetchAllData();
  }, [token]);

  const handleDeleteReservation = async (id: number, username: string, spaceName: string) => {
    if (!confirm(`Are you sure you want to delete ${username}'s reservation for ${spaceName}?`)) return;

    try {
      const res = await fetch(`${BACKEND}/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete reservation");
      }

      await fetchAllData();
      alert("Reservation deleted successfully");
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-400 border-t-transparent" />
      </main>
    );
  }

  if (error) return <p className="text-red-600 p-6">{error}</p>;

  const filtered = reservations
    .filter(r => String(r.status).toUpperCase() === activeTab)
    .filter(r => r.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Reservations Management</h1>

      <div className="flex gap-4 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === tab ? 'bg-pink-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by username..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 w-full border rounded px-3 py-2"
      />

      {filtered.length === 0 ? (
        <p>There are no {activeTab.toLowerCase()} reservations matching the search.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => {
            const space = spaces.find(s => s.id === Number(res.spaceId));
            const user = users.find(u => u.username === res.username);
            const spaceImageUrl = space?.imageUrl;
            const userImageUrl = user?.imageUrl;

            return (
              <li
                key={res.id}
                className="relative rounded-3xl overflow-hidden min-h-[240px] border border-gray-200 shadow-lg hover:shadow-2xl transition"
                style={{
                  backgroundImage: spaceImageUrl
                    ? `linear-gradient(to top, rgba(255,255,255,0.60), rgba(255,255,255,0.55)), url(${spaceImageUrl})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
              <div className="relative z-10 p-6 flex flex-col justify-end h-full backdrop-blur-sm">
                <button
                  onClick={() => handleDeleteReservation(res.id, res.username, res.spaceName)}
                  className="absolute top-4 right-4 bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-pink-700 transition shadow-md"
                >
                  Delete
                </button>
                  <div className="flex gap-2 items-center text-sm mt-2 justify-between">
                    <h2 className="text-xl font-extrabold text-gray-800">{res.spaceName}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      res.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : res.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                <div className="flex items-center gap-3 mb-3 mt-2">
                  {userImageUrl ? (
                    <img
                      src={userImageUrl}
                      className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
                      alt={res.username}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-pink-600 font-bold text-lg border-2 border-pink-400 shadow">
                      {res.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-pink-700 text-base">{res.username}</h3>
                    <p className="text-gray-600 text-sm">
                      {res.reservationDate} · {res.timeSlot}
                    </p>
                  </div>
                </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
