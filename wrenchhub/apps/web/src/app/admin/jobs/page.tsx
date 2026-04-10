"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AdminJob {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  location: string;
  status: string;
  createdAt: string;
  owner: { name: string; email: string };
  vehicle: { year: number; make: string; model: string };
  _count: { bids: number };
}

export default function AdminJobsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["admin-jobs", statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      return apiFetch<AdminJob[]>(`/api/admin/jobs?${params}`);
    },
  });

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    bidding: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
    closed: "bg-gray-100 text-gray-500",
  };

  const urgencyColors: Record<string, string> = {
    asap: "bg-red-100 text-red-700",
    within_a_week: "bg-yellow-100 text-yellow-700",
    flexible: "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Jobs ({jobs.length})</h2>

      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="bidding">Bidding</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          No jobs found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Bids</th>
                <th className="px-4 py-3">Posted</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-xs text-gray-500">
                      {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} &bull; {job.location}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{job.owner.name}</div>
                    <div className="text-xs text-gray-500">{job.owner.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[job.status] || "bg-gray-100"}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyColors[job.urgency] || ""}`}>
                      {job.urgency.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{job._count.bids}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
