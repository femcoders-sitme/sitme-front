'use client';
import { useEffect, useState } from 'react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string>();

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

  useEffect(() => {
    fetch('/api/reservations')
      .then(res => {
        if (!res.ok) throw new Error('Error cargando reservas');
        return res.json();
      })
      .then(data => {
        setReservations(data);
      })
      .catch(() => setError('No se pudieron cargar las reservas'));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Reservations</h1>
      <ul className="space-y-2">
        {reservations.map((res, index) => (
          <li key={index} className="border p-3 rounded">
            <div className="font-medium">
              {res.username} → {res.spaceName}
            </div>
            <div className="text-sm opacity-70">
              {res.reservationDate} · {res.timeSlot} · Estado: {res.status}
            </div>
            <div className="text-sm">
              Email enviado: {res.emailSent ? '✅ Sí' : '❌ No'}
            </div>
            <div className="text-xs opacity-60">
              Creado: {new Date(res.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
