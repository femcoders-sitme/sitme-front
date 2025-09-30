'use client';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Menu, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { isLoggedIn, role, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b relative">
      <Link href="/" className="text-xl font-bold hover:opacity-80">
        <img
          src="https://res.cloudinary.com/dnrtgr353/image/upload/v1758750516/logo_sitme_web_mjszsa.png"
          alt="SitMe logo"
          width={80}
        />
      </Link>

      <div className="flex gap-4 items-center">
        {isLoggedIn && (
          <>
            <Link href="/profile" className="hover:opacity-80">
              <UserCircle className="w-8 h-8 text-gray-700 hover:text-pink-600" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-6 h-6 text-gray-700 hover:text-red-600" />
            </button>
          </>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {menuOpen && (
        <nav
          ref={menuRef}
          className="absolute right-6 top-14 bg-white border rounded-lg shadow-lg p-4 w-48 space-y-2 z-50"
        >
          <Link
            href="/spaces"
            onClick={() => setMenuOpen(false)}
            className="block hover:text-pink-600"
          >
            Spaces
          </Link>

          {role === "ADMIN" && (
            <>
              <Link
                href="/reservations"
                onClick={() => setMenuOpen(false)}
                className="block hover:text-pink-600"
              >
                Reservations
              </Link>
              <Link
                href="/users"
                onClick={() => setMenuOpen(false)}
                className="block hover:text-pink-600"
              >
                Users
              </Link>
            </>
          )}

          {role === "USER" && (
            <Link
              href="/my-reservations"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-pink-600"
            >
              My reservations
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
