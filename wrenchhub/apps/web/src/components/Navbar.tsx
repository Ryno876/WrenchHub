"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-brand-dark text-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-xl font-extrabold">
        <span className="text-brand-orange">Wrench</span>
        <span className="text-brand-teal">Hub</span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {loading ? null : user ? (
          <>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            {user.role === "car_owner" && (
              <Link href="/dashboard/vehicles" className="hover:text-gray-300">
                My Vehicles
              </Link>
            )}
            {user.role === "mechanic" && (
              <Link
                href="/mechanic/profile/edit"
                className="hover:text-gray-300"
              >
                My Profile
              </Link>
            )}
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
            <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-gray-300">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-brand-orange px-4 py-2 rounded-lg font-semibold hover:opacity-90"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
