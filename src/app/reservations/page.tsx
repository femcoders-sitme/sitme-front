'use client';
import { useEffect, useState } from 'react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [search, setSearch] = useState('');

  type Reservation = {
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

  useEffect(() => {
    fetch('/api/reservations')
      .then(res => {
        if (!res.ok) throw new Error('Error fetching reservations');
        return res.json();
      })
      .then(data => {
        setReservations(data);
      })
      .catch(() => setError('Error fetching reservations'));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;

  const filtered = reservations
    .filter(r => String(r.status).toUpperCase() === activeTab)
    .filter(r => r.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Reservations</h1>

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
        <ul className="space-y-2">
          {filtered.map((res, index) => (
            <li key={index} className="border p-3 rounded bg-white shadow-sm hover:shadow transition">
              <div className="font-medium text-pink-600">
                {res.username} → {res.spaceName}
              </div>
              <div className="text-sm opacity-70">
                {res.reservationDate} · {res.timeSlot} · Status: {res.status}
              </div>
              <div className="text-sm">
                Sent email: {res.emailSent ? '✅ Sí' : '❌ No'}
              </div>
              <div className="text-xs opacity-60">
                Created at: {new Date(res.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
