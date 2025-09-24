'use client';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b">
        <Link href="/" className="text-xl font-bold hover:opacity-80">
            <img src="https://res.cloudinary.com/dnrtgr353/image/upload/v1758750516/logo_sitme_web_mjszsa.png" alt="" srcSet="" width={80} />
        </Link>
        <button className="p-2 rounded hover:bg-gray-100">
            <Menu className="w-6 h-6" />
        </button>
    </header>
  );
}
