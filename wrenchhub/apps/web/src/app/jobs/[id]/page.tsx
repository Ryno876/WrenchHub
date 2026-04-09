"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string | null;
  photos: string[];
  serviceTypePreference: string;
  urgency: string;
  location: string;
  status: string;
  createdAt: string;
  vehicle: { year: number; make: string; model: string; mileage: number };
  owner: { name: string; location: string | null };
  bids: Array<{
    id: string;
    totalPrice: number;
    partsBreakdown: string;
    laborHours: number;
    laborRate: number;
    fees: number;
    estimatedCompletionTime: string;
    notes: string;
    availability: string;
    status: string;
    mechanicProfile: {
      id: string;
      businessName: string;
      profilePhoto: string | null;
      verified: boolean;
      serviceType: string;
      location: string;
    };
    mechanic: { name: string };
  }>;
  _count: { bids: number };
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => apiFetch<JobDetail>(`/api/jobs/${id}`),
  });

  const acceptBid = useMutation({
    mutationFn: (bidId: string) =>
      apiFetch(`/api/jobs/${id}/accept-bid`, {
        method: "POST",
        body: JSON.stringify({ bidId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  const urgencyColors: Record<string, string> = {
    asap: "bg-red-100 text-red-700",
    within_a_week: "bg-yellow-100 text-yellow-700",
    flexible: "bg-green-100 text-green-700",
  };

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    bidding: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
          &larr; Back
        </button>

        {/* Job details */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-gray-500 text-sm">
                {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} &bull; {job.vehicle.mileage.toLocaleString()} mi
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status] || "bg-gray-100"}`}>
                {job.status.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyColors[job.urgency] || ""}`}>
                {job.urgency.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{job.description}</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span>📍 {job.location}</span>
            <span className="capitalize">🔧 {job.serviceTypePreference.replace("_", " ")}</span>
            <span className="capitalize">📂 {job.category.replace("_", " ")}{job.subCategory ? ` — ${job.subCategory}` : ""}</span>
          </div>
        </div>

        {/* Bids */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bids ({job._count.bids})</h2>
        </div>

        {job.bids.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <p className="text-lg mb-1">No bids yet</p>
            <p className="text-sm">Mechanics will see your job and start bidding soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {job.bids.map((bid) => {
              let parts: Array<{ name: string; cost: number }> = [];
              try { parts = JSON.parse(bid.partsBreakdown); } catch { /* ignore */ }

              return (
                <div
                  key={bid.id}
                  className={`bg-white rounded-2xl border p-5 ${
                    bid.status === "accepted" ? "border-2 border-green-500" :
                    bid.status === "rejected" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-sm">
                        {bid.mechanicProfile.businessName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {bid.mechanicProfile.businessName}
                          {bid.mechanicProfile.verified && <span className="text-brand-teal ml-1">✓</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bid.mechanicProfile.location} &bull; {bid.mechanicProfile.serviceType}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold">${bid.totalPrice.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Est. {bid.estimatedCompletionTime}</div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                    {parts.map((p, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{p.name}</span>
                        <span>${p.cost.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Labor ({bid.laborHours}hrs × ${bid.laborRate}/hr)</span>
                      <span>${(bid.laborHours * bid.laborRate).toFixed(2)}</span>
                    </div>
                    {bid.fees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fees/supplies</span>
                        <span>${bid.fees.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {bid.notes && (
                    <p className="text-sm text-gray-600 italic mb-3">&ldquo;{bid.notes}&rdquo;</p>
                  )}

                  {bid.status === "pending" && job.status !== "accepted" && (
                    <button
                      onClick={() => acceptBid.mutate(bid.id)}
                      disabled={acceptBid.isPending}
                      className="w-full bg-brand-orange text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                    >
                      {acceptBid.isPending ? "Accepting..." : "Accept This Bid"}
                    </button>
                  )}

                  {bid.status === "accepted" && (
                    <div className="text-center text-green-600 font-semibold text-sm py-2">
                      ✓ Bid Accepted
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
