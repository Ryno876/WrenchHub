"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface MyBid {
  id: string;
  totalPrice: number;
  status: string;
  estimatedCompletionTime: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    status: string;
    location: string;
    vehicle: { year: number; make: string; model: string; mileage: number };
    owner: { name: string };
  };
}

export default function MyBidsPage() {
  const { data: bids = [], isLoading } = useQuery({
    queryKey: ["my-bids"],
    queryFn: () => apiFetch<MyBid[]>("/api/bids/mine"),
  });

  const statusStyles: Record<string, { bg: string; label: string }> = {
    pending: { bg: "bg-yellow-100 text-yellow-700", label: "PENDING" },
    accepted: { bg: "bg-green-100 text-green-700", label: "ACCEPTED" },
    rejected: { bg: "bg-red-100 text-red-700", label: "NOT SELECTED" },
    withdrawn: { bg: "bg-gray-100 text-gray-500", label: "WITHDRAWN" },
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
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">My Bids</h1>

        {isLoading ? (
          <p className="text-gray-500">Loading bids...</p>
        ) : bids.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <p className="text-lg mb-1">No bids yet</p>
            <p className="text-sm">Browse the job feed to find jobs and place bids.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => {
              const style = statusStyles[bid.status] || statusStyles.pending;
              return (
                <div key={bid.id} className="bg-white rounded-xl border p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{bid.job.title}</h3>
                      <p className="text-sm text-gray-500">
                        {bid.job.vehicle.year} {bid.job.vehicle.make} {bid.job.vehicle.model} &bull; {bid.job.owner.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold">${bid.totalPrice.toFixed(0)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg}`}>
                        {style.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>📍 {bid.job.location}</span>
                    <span>⏱ Est. {bid.estimatedCompletionTime}</span>
                    <span>Bid placed {timeAgo(bid.createdAt)}</span>
                  </div>
                  {bid.status === "accepted" && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
                      &#127881; Your bid was accepted! Contact the car owner to schedule the work.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
