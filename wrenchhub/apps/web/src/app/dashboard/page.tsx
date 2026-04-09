"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface MyJob {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  vehicle: { year: number; make: string; model: string };
  _count: { bids: number };
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: myJobs = [] } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => apiFetch<MyJob[]>("/api/jobs/mine"),
    enabled: user?.role === "car_owner",
  });

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    bidding: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {user?.role === "car_owner" && (
          <>
            <Link href="/dashboard/vehicles" className="bg-white rounded-xl border p-6 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-1">My Vehicles</h3>
              <p className="text-sm text-gray-500">Add and manage your cars</p>
            </Link>
            <Link href="/jobs/new" className="bg-brand-orange text-white rounded-xl p-6 hover:opacity-90 transition">
              <h3 className="font-bold text-lg mb-1">Post a Job</h3>
              <p className="text-sm text-white/80">Get bids from mechanics</p>
            </Link>
            <Link href="/browse" className="bg-white rounded-xl border p-6 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-1">Browse Mechanics</h3>
              <p className="text-sm text-gray-500">Find mechanics near you</p>
            </Link>
          </>
        )}

        {user?.role === "mechanic" && (
          <>
            <Link href="/mechanic/profile/edit" className="bg-white rounded-xl border p-6 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-1">My Profile</h3>
              <p className="text-sm text-gray-500">Set up your mechanic profile</p>
            </Link>
            <Link href="/mechanic/jobs" className="bg-brand-orange text-white rounded-xl p-6 hover:opacity-90 transition">
              <h3 className="font-bold text-lg mb-1">Job Feed</h3>
              <p className="text-sm text-white/80">Find jobs and place bids</p>
            </Link>
            <Link href="/mechanic/bids" className="bg-white rounded-xl border p-6 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-1">My Bids</h3>
              <p className="text-sm text-gray-500">Track your bid status</p>
            </Link>
          </>
        )}
      </div>

      {/* Car owner: My posted jobs */}
      {user?.role === "car_owner" && myJobs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">My Jobs</h2>
          <div className="space-y-3">
            {myJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white rounded-xl border p-4 hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-sm text-gray-500">
                      {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} &bull; {job._count.bids} bid{job._count.bids !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status] || "bg-gray-100"}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
