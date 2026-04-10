"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AdminStats {
  stats: {
    totalUsers: number;
    totalCarOwners: number;
    totalMechanics: number;
    totalJobs: number;
    activeJobs: number;
    totalBids: number;
    totalReviews: number;
    verifiedMechanics: number;
    totalConversations: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    owner: { name: string; email: string };
    vehicle: { year: number; make: string; model: string };
    _count: { bids: number };
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isAdmin: boolean;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch<AdminStats>("/api/admin/stats"),
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const { stats, recentJobs, recentUsers } = data;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, color: "bg-blue-500" },
    { label: "Car Owners", value: stats.totalCarOwners, color: "bg-orange-500" },
    { label: "Mechanics", value: stats.totalMechanics, color: "bg-teal-500" },
    { label: "Verified Mechanics", value: stats.verifiedMechanics, color: "bg-green-500" },
    { label: "Total Jobs", value: stats.totalJobs, color: "bg-purple-500" },
    { label: "Active Jobs", value: stats.activeJobs, color: "bg-indigo-500" },
    { label: "Total Bids", value: stats.totalBids, color: "bg-pink-500" },
    { label: "Reviews", value: stats.totalReviews, color: "bg-yellow-500" },
    { label: "Conversations", value: stats.totalConversations, color: "bg-gray-500" },
  ];

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    bidding: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-4">
            <div className={`w-3 h-3 rounded-full ${card.color} mb-2`} />
            <div className="text-2xl font-extrabold">{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent Jobs</h3>
            <Link href="/admin/jobs" className="text-sm text-brand-orange hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-sm">{job.title}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[job.status] || "bg-gray-100"}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} &bull; by {job.owner.name} &bull; {job._count.bids} bids &bull; {timeAgo(job.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent Users</h3>
            <Link href="/admin/users" className="text-sm text-brand-orange hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl border p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm">
                    {user.name}
                    {user.isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ADMIN</span>}
                  </div>
                  <div className="text-xs text-gray-500">{user.email} &bull; {user.role.replace("_", " ")} &bull; {timeAgo(user.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
