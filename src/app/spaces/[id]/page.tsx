'use client';

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoggedIn, role, token, user } = useAuth();
  const [space, setSpace] = useState<any>(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("MORNING");
  const [message, setMessage] = useState<string>();
  const [reservationStatus, setReservationStatus] = useState<"success" | "conflict" | "error" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const router = useRouter();

  useEffect(() => {
    const fetchSpace = async () => {
      const res = await fetch(`${BACKEND}/api/spaces/${id}`, {
        cache: "no-store",
      });
      if (res.ok) {
        setSpace(await res.json());
      }
    };
    fetchSpace();
  }, [id]);

  const handleReservation = async () => {
    if (!token) return;

    const payload = {
      spaceId: Number(id),
      reservationDate: date,
      timeSlot,
    };

    try {
      const res = await fetch(`${BACKEND}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

    if (res.status === 201) {
      setReservationStatus("success");
      setMessage("Reservation created successfully ✅");
      openModal();
      router.refresh();
      return;
    }

    if (res.status === 409) {
      setReservationStatus("conflict");
      setMessage("This space is already booked for that date and time ❌ Please choose another one.");
      openModal();
      return;
    }

    throw new Error("Reservation failed");

    } catch (error) {
      setReservationStatus("error");
      setMessage("Unexpected error creating reservation ❌");
      openModal();
    }
  };

  if (!space) return <p className="p-8">Loading...</p>;

  return (
    <>
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">{space.name}</h1>

        <div className="flex flex-col gap-8 md:grid md:grid-cols-2">
          <section>
            {space.imageUrl && (
              <img
                src={space.imageUrl}
                alt={space.name}
                className="rounded-lg shadow mb-6 w-full max-h-[400px] object-cover"
              />
            )}

            <div className="space-y-2 mb-6">
              <p>
                <strong>Type:</strong> {space.type}
              </p>
              <p>
                <strong>Capacity:</strong> {space.capacity}
              </p>
            </div>
          </section>
          <section>
            {!isLoggedIn ? (
              <p>
                You must{" "}
                <a href="/login" className="text-blue-600 underline">
                  login
                </a>{" "}
                first to make a reservation.
              </p>
            ) : (
              <div className="border p-4 rounded-lg shadow-md">
                <h2 className="font-semibold mb-4 text-xl">Make a Reservation</h2>

                <label className="block mb-2">
                  Date:
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </label>

                <label className="block mb-4">
                  Time slot:
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="FULL_DAY">Full Day</option>
                  </select>
                </label>

                <button
                  onClick={handleReservation}
                  className="rounded-full border border-transparent transition-colors flex items-center justify-center font-medium text-base h-12 px-6 mt-4 mx-auto"
                  style={{
                    backgroundColor: "#E20074",
                    color: "white",
                  }}
                >
                  Make Reservation
                </button>

                {message && <p className="mt-4 text-center">{message}</p>}
              </div>
            )}
          </section>
        </div>
      </main>
      {showModal && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1 text-center text-gray-800">
              {reservationStatus === "success" && "Reservation Created"}
              {reservationStatus === "conflict" && "Reservation Unavailable"}
              {reservationStatus === "error" && "Reservation Failed"}
            </h3>
            <p className="text-sm text-gray-600 text-center">{message}</p>
          </div>
        </div>
      )}
    </>
  );
}
