'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

type Reservation = {
  id: number;
  reservationDate: string;
  timeSlot: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  spaceName: string;
};

const tabs: ("ACTIVE" | "COMPLETED" | "CANCELLED")[] = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

export default function MyReservationsPage() {
  const { token, isLoggedIn } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "CANCELLED">("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token === null) return;

    if (!isLoggedIn || !token) {
      setLoading(false);
      setError("You must log in to view your reservations");
      return;
    }

    const fetchReservations = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/reservations/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch reservations");
        }
        const data = await res.json();
        setReservations(data.data || []);
      } catch {
        setError("Error loading reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn, token]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const filtered = reservations.filter((r) => r.status === activeTab);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>

      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeTab === tab
                ? "bg-pink-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No {activeTab.toLowerCase()} reservations.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <p className="font-semibold text-pink-600">{r.spaceName}</p>
              <p className="text-sm text-gray-600">
                {r.reservationDate} — {r.timeSlot}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                {r.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
