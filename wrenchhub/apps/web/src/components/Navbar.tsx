"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-brand-dark text-white px-6 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold">
          <span className="text-white">The </span>
          <span className="text-brand-orange">Wrench</span>
          <span className="text-brand-teal"> Hub</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:text-gray-300">
            Browse Mechanics
          </Link>
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
              {user.role === "car_owner" && (
                <Link href="/jobs/new" className="bg-brand-orange px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                  Post a Job
                </Link>
              )}
              {user.role === "mechanic" && (
                <Link href="/mechanic/jobs" className="hover:text-gray-300">
                  Job Feed
                </Link>
              )}
              <Link href="/messages" className="hover:text-gray-300">
                Messages
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="text-red-400 hover:text-red-300 font-semibold">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="text-gray-400 hover:text-white">
                Sign Out
              </button>
              <span className="bg-brand-orange text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </span>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Sign In
              </Link>
              <Link href="/register" className="bg-brand-orange px-4 py-2 rounded-lg font-semibold hover:opacity-90">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-1"
        >
          <span className={`w-6 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-2 space-y-3 text-sm border-t border-white/10 pt-4">
          <Link href="/browse" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
            Browse Mechanics
          </Link>
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              {user.role === "car_owner" && (
                <>
                  <Link href="/dashboard/vehicles" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                    My Vehicles
                  </Link>
                  <Link href="/jobs/new" className="block text-brand-orange font-semibold" onClick={() => setMenuOpen(false)}>
                    Post a Job
                  </Link>
                </>
              )}
              {user.role === "mechanic" && (
                <>
                  <Link href="/mechanic/jobs" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                    Job Feed
                  </Link>
                  <Link href="/mechanic/profile/edit" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                    My Profile
                  </Link>
                </>
              )}
              <Link href="/messages" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                Messages
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="block text-red-400 font-semibold" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="block text-gray-400 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link href="/register" className="block text-brand-orange font-semibold" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
