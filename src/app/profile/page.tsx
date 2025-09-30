"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;

export default function ProfilePage() {
    const { token } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);
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
        formData.append("user", JSON.stringify(form));

        const res = await fetch(`${BACKEND}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        });

        const data = await res.json();
        setProfile(data.data);
        setEditing(false);
    };

    if (!token) {
        return <div className="flex justify-center items-center py-16"><p>You must <a href="/login" className="text-pink-600">login</a> to view your profile.</p></div>;
    }

    if (profile === null) {
        return <div className="flex justify-center items-center py-16"><p>Session expired. <a href="/login" className="text-pink-600">Login again</a></p></div>;
    }

    return (
        <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        {!editing ? (
            <div className="space-y-2">
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            {profile.imageUrl && (
                <img
                src={profile.imageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mt-2"
                />
            )}
            <button
                onClick={() => setEditing(true)}
                className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg"
            >
                Edit
            </button>
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

            <div className="flex gap-4">
                <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                Save
                </button>
                <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                Cancel
                </button>
            </div>
            </form>
        )}
        </div>
    );
}
