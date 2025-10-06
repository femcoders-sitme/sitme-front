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

    const isAdmin =
    Array.isArray(role)
      ? role.includes("ROLE_ADMIN")
      : role?.replace(/[\[\]]/g, "").includes("ADMIN");

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
        setMessage("Reservation created successfully");
        openModal();
        router.refresh();
        return;
      }

      if (res.status === 409) {
        setReservationStatus("conflict");
        setMessage("This space is already booked for that date and time. Please choose another one.");
        openModal();
        return;
      }

      throw new Error("Reservation failed");

    } catch (error) {
      setReservationStatus("error");
      setMessage("Unexpected error creating reservation");
      openModal();
    }
  };

  if (!space) return <p className="p-8">Loading...</p>;

  return (
    <>
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-8 text-center sm:text-left">
          {space.name}
        </h1>
        <div className="flex flex-col gap-8 md:grid md:grid-cols-2">
          <section>
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6 w-full max-h-[400px] flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
              {space.imageUrl && (
                <img
                  src={space.imageUrl}
                  alt={space.name}
                  className="w-full h-full object-cover opacity-90 transition-all duration-300 hover:scale-105"
                />
              )}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow ${
                  space.type === 'ROOM'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {space.type}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-6 bg-white/80 rounded-xl p-4 shadow">
              <p className="text-lg font-semibold text-gray-700">
                <span className="text-gray-500 font-normal">Type:</span> {space.type}
              </p>
              <p className="text-lg font-semibold text-gray-700">
                <span className="text-gray-500 font-normal">Capacity:</span> {space.capacity}
              </p>
            </div>
          </section>
          <section>
            <div className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center">
              {!isLoggedIn ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-2xl font-bold text-gray-800 mb-2">Reserve your spot</div>
                  <p className="text-gray-600 text-center mb-2">
                    You must <a href="/login" className="text-pink-600 font-semibold hover:underline">login</a> first to make a reservation.
                  </p>
                  <a
                    href="/login"
                    className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 text-lg shadow transition-all"
                  >
                    Login
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={e => { e.preventDefault(); handleReservation(); }}
                  className="flex flex-col gap-4 w-full"
                >
                  <h2 className="font-extrabold mb-2 text-xl text-gray-900 text-center">
                    {isAdmin ? "Check this space" : "Make a Reservation"}
                  </h2>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="border-b-2 border-gray-300 focus:border-pink-500 outline-none bg-transparent py-2 px-1 text-base transition-all rounded"
                  />
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Time slot</label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="border-b-2 border-gray-300 focus:border-pink-500 outline-none bg-transparent py-2 px-1 text-base transition-all rounded"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="FULL_DAY">Full Day</option>
                  </select>
                  <button
                    type="submit"
                    className={`rounded-full font-bold py-3 px-8 text-lg shadow transition-all mt-4 mx-auto
                      ${role?.includes("ADMIN")
                        ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-pink-600 hover:bg-pink-700 text-white"
                      }`}
                    disabled={role?.includes("ADMIN")}
                  >
                    Make Reservation
                  </button>
                  {message && <p className="mt-4 text-center text-pink-600">{message}</p>}
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2">
              {reservationStatus === "success" && (
                <span className="inline-block text-3xl">✅</span>
              )}
              {reservationStatus === "conflict" && (
                <span className="inline-block text-3xl">❌</span>
              )}
              {reservationStatus === "error" && (
                <span className="inline-block text-3xl">⚠️</span>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2 text-center text-gray-800">
              {reservationStatus === "success" && "Reservation Created"}
              {reservationStatus === "conflict" && "Reservation Unavailable"}
              {reservationStatus === "error" && "Reservation Failed"}
            </h3>
            <p className="text-base text-gray-600 text-center mb-4">{message}</p>
            <button
              onClick={closeModal}
              className="rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 shadow transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}