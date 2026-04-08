"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">
        Welcome, {user?.name?.split(" ")[0]}!
      </h1>
      <p className="text-gray-500 mb-8">
        {user?.role === "car_owner"
          ? "Manage your vehicles and find mechanics."
          : "Manage your profile and find jobs."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.role === "car_owner" && (
          <>
            <Link
              href="/dashboard/vehicles"
              className="bg-white rounded-xl border p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-1">My Vehicles</h3>
              <p className="text-sm text-gray-500">
                Add and manage your cars
              </p>
            </Link>
            <div className="bg-white rounded-xl border p-6 opacity-50">
              <h3 className="font-bold text-lg mb-1">Post a Job</h3>
              <p className="text-sm text-gray-500">Coming in Phase 2</p>
            </div>
          </>
        )}

        {user?.role === "mechanic" && (
          <>
            <Link
              href="/mechanic/profile/edit"
              className="bg-white rounded-xl border p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-1">My Profile</h3>
              <p className="text-sm text-gray-500">
                Set up your mechanic profile
              </p>
            </Link>
            <div className="bg-white rounded-xl border p-6 opacity-50">
              <h3 className="font-bold text-lg mb-1">Job Feed</h3>
              <p className="text-sm text-gray-500">Coming in Phase 2</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
