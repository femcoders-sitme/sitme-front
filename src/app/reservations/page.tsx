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

const tabs: Array<'ACTIVE' | 'COMPLETED' | 'CANCELLED'> = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

export default function ReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [search, setSearch] = useState('');

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      
      if (!res.ok) throw new Error('Error fetching reservations');
      
      const data = await res.json();
      setReservations(data.data || []);
    } catch {
      setError('Error fetching reservations');
    }
  };

  useEffect(() => {
    if (token) {
      fetchReservations();
    }
  }, [token]);

  const handleDeleteReservation = async (id: number, username: string, spaceName: string) => {
    if (!confirm(`Are you sure you want to delete ${username}'s reservation for ${spaceName}?`)) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete reservation");
      }

      await fetchReservations();
      alert("Reservation deleted successfully");
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  if (error) return <p className="text-red-600 p-6">{error}</p>;

  const filtered = reservations
    .filter(r => String(r.status).toUpperCase() === activeTab)
    .filter(r => r.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-6 max-w-4xl mx-auto">
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
        <ul className="space-y-3">
          {filtered.map((res) => (
            <li key={res.id} className="border p-4 rounded-lg bg-white shadow-sm hover:shadow transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-pink-600">
                    {res.username} → {res.spaceName}
                  </div>
                  <div className="text-sm opacity-70 mt-1">
                    {res.reservationDate} · {res.timeSlot} · Status: {res.status}
                  </div>
                  <div className="text-sm mt-1">
                    Email sent: {res.emailSent ? '✅ Yes' : '❌ No'}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    Created: {new Date(res.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteReservation(res.id, res.username, res.spaceName)}
                  className="ml-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}