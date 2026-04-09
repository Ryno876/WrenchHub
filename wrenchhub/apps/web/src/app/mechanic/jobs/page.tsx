"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface JobListing {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string | null;
  serviceTypePreference: string;
  urgency: string;
  location: string;
  status: string;
  createdAt: string;
  vehicle: { year: number; make: string; model: string; mileage: number };
  owner: { name: string };
  _count: { bids: number };
}

export default function MechanicJobFeedPage() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job-feed", categoryFilter, urgencyFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      if (urgencyFilter) params.set("urgency", urgencyFilter);
      return apiFetch<JobListing[]>(`/api/jobs?${params}`);
    },
  });

  const urgencyColors: Record<string, string> = {
    asap: "bg-red-100 text-red-700",
    within_a_week: "bg-yellow-100 text-yellow-700",
    flexible: "bg-green-100 text-green-700",
  };

  const categoryColors: Record<string, string> = {
    maintenance: "bg-purple-100 text-purple-700",
    repair: "bg-orange-100 text-orange-700",
    diagnostics: "bg-blue-100 text-blue-700",
    body_work: "bg-pink-100 text-pink-700",
    other: "bg-gray-100 text-gray-700",
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Available Jobs</h1>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Categories</option>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="diagnostics">Diagnostics</option>
            <option value="body_work">Body Work</option>
            <option value="other">Other</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Urgency</option>
            <option value="asap">ASAP</option>
            <option value="within_a_week">This Week</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <p className="text-lg mb-1">No jobs available</p>
            <p className="text-sm">Check back later for new jobs in your area.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                      {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} &bull; {timeAgo(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${urgencyColors[job.urgency]}`}>
                      {job.urgency.replace("_", " ").toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryColors[job.category]}`}>
                      {job.category.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📍 {job.location}</span>
                    <span className="capitalize">🔧 {job.serviceTypePreference.replace("_", " ")}</span>
                    <span>💬 {job._count.bids} bid{job._count.bids !== 1 ? "s" : ""}</span>
                  </div>
                  <Link
                    href={`/mechanic/jobs/${job.id}`}
                    className="bg-brand-orange text-white px-5 py-2 rounded-lg text-sm font-semibold"
                  >
                    View & Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
