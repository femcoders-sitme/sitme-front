"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

export default function ProfilePage() {
    const { token } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [inputKey, setInputKey] = useState(Date.now());
    const [form, setForm] = useState({ username: "", email: "", password: "" });

    useEffect(() => {
        if (!token) return;

        fetch(`${BACKEND}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => {
                const user = data.data;
                setProfile(user);
                setForm({ username: user.username, email: user.email, password: "" });
            })
            .catch((err) => {
                console.error(err);
                setProfile(null);
            });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        
        // Preparar el objeto user eliminando el password si está vacío
        const userPayload = {
            username: form.username,
            email: form.email,
            ...(form.password && form.password.trim() !== "" ? { password: form.password } : {})
        };
        
        console.log("📝 User payload:", userPayload);
        
        // Crear el Blob con el tipo correcto y nombre explícito
        const userBlob = new Blob([JSON.stringify(userPayload)], { type: "application/json" });
        formData.append("user", userBlob, "user.json");

        if (image) {
            console.log("📦 Enviando imagen nueva:", image.name, "size:", image.size, "type:", image.type);
            formData.append("file", image); // IMPORTANTE: debe ser "file" para coincidir con el backend
        } else {
            console.log("⚠️ No hay imagen nueva para enviar");
        }

        console.log("=== VERIFICACIÓN FORMDATA ===");
        for (const pair of formData.entries()) {
            console.log("🧪 FormData:", pair[0], pair[1]);
        }

        try {
            const res = await fetch(`${BACKEND}/api/users/me`, {
                method: "PUT",
                body: formData,
                headers: new Headers([["Authorization", `Bearer ${token}`]]),
            });

            const data = await res.json();
            console.log("✅ Update response:", res.status, data);

            if (!res.ok) {
                throw new Error(`Update failed (${res.status}): ${data?.message || "Unknown error"}`);
            }

            // Refrescar el perfil para obtener la nueva imagen
            const refreshed = await fetch(`${BACKEND}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const newData = await refreshed.json();
            console.log("🔄 Profile refreshed:", newData.data);
            setProfile(newData.data);

            setEditing(false);
            setImage(null);
            setInputKey(Date.now());
        } catch (error) {
            console.error("❌ Error updating profile:", error);
            alert("Error updating profile: " + (error as Error).message);
        }
    };

    if (!token) {
        return <div className="flex justify-center items-center py-16"><p>You must <a href="/login" className="text-pink-600">login</a> to view your profile.</p></div>;
    }

    if (profile === null) {
        return <div className="flex justify-center items-center py-16"><p>Session expired. <a href="/login" className="text-pink-600">Login again</a></p></div>;
    }

    return (
        <main className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Profile</h1>

            {!editing ? (
                <div className="max-w-sm mx-auto bg-white shadow-lg rounded-2xl p-6 text-center">
                    <div className="flex justify-center mb-4">
                        {profile.imageUrl ? (
                            <img
                                src={profile.imageUrl}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 shadow">
                                {profile.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{profile.username}</h2>
                    <p className="text-gray-600 text-sm">{profile.email}</p>
                    <span
                        className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            profile.role === "ADMIN"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {profile.role}
                    </span>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                setEditing(true);
                                setImage(null);
                                setInputKey(Date.now());
                            }}
                            className="rounded-full border border-transparent transition-colors flex items-center justify-center font-medium text-base h-12 px-6 w-full"
                            style={{
                                backgroundColor: "#E20074",
                                color: "white",
                            }}>
                            Edit Profile
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-medium">Username</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Password (optional)</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Imagen de perfil</label>
                        {image ? (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow"
                            />
                        ) : profile.imageUrl ? (
                            <img
                                src={profile.imageUrl}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 shadow"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 shadow">
                                {profile.username[0].toUpperCase()}
                            </div>
                        )}
                        <input
                            key={inputKey}
                            type="file"
                            accept="image/*"
                            onChange={e => setImage(e.target.files?.[0] || null)}
                            className="w-full border rounded p-2 mt-2"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="rounded-full border border-transparent transition-colors flex items-center justify-center font-medium text-base h-12 px-6"
                            style={{
                                backgroundColor: "#E20074",
                                color: "white",
                            }}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false);
                                setInputKey(Date.now());
                            }}
                            className="rounded-full border border-transparent transition-colors flex items-center justify-center font-medium text-base h-12 px-6 bg-gray-400 text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}