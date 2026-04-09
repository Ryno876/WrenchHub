"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
    mechanicId: string;
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

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

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

  const markCompleted = useMutation({
    mutationFn: () =>
      apiFetch(`/api/jobs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      setShowReviewForm(true);
    },
  });

  const submitReview = useMutation({
    mutationFn: ({ mechanicProfileId }: { mechanicProfileId: string }) =>
      apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          mechanicProfileId,
          rating: reviewRating,
          text: reviewText,
        }),
      }),
    onSuccess: () => {
      setShowReviewForm(false);
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
  });

  const startConversation = useMutation({
    mutationFn: (mechanicUserId: string) =>
      apiFetch<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ recipientId: mechanicUserId, jobId: id }),
      }),
    onSuccess: (data) => {
      router.push(`/messages/${data.id}`);
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

  const acceptedBid = job.bids.find((b) => b.status === "accepted");

  const urgencyColors: Record<string, string> = {
    asap: "bg-red-100 text-red-700",
    within_a_week: "bg-yellow-100 text-yellow-700",
    flexible: "bg-green-100 text-green-700",
  };

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-700",
    bidding: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-gray-200 text-gray-700",
    closed: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
          &larr; Back to Dashboard
        </button>

        {/* Job details */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
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
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>📍 {job.location}</span>
            <span className="capitalize">🔧 {job.serviceTypePreference.replace("_", " ")}</span>
            <span className="capitalize">📂 {job.category.replace("_", " ")}{job.subCategory ? ` — ${job.subCategory}` : ""}</span>
          </div>

          {/* Mark as completed button */}
          {job.status === "accepted" && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 mb-3">
                Work in progress with <strong>{acceptedBid?.mechanicProfile.businessName}</strong>. Once the repair is done, mark it as completed to leave a review.
              </p>
              <button
                onClick={() => markCompleted.mutate()}
                disabled={markCompleted.isPending}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
              >
                {markCompleted.isPending ? "Updating..." : "Mark as Completed"}
              </button>
            </div>
          )}

          {/* Completed status */}
          {job.status === "completed" && !showReviewForm && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
              <p className="text-sm text-gray-600">
                &#10003; Job completed with <strong>{acceptedBid?.mechanicProfile.businessName}</strong>
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-2 text-brand-orange text-sm font-semibold hover:underline"
              >
                Leave a Review
              </button>
            </div>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && acceptedBid && (
          <div className="bg-white rounded-2xl border p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">
              Review {acceptedBid.mechanicProfile.businessName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition ${star <= reviewRating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      &#9733;
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="How was your experience? Was the work done well? Was the pricing fair?"
                  className="w-full border rounded-lg px-4 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => submitReview.mutate({ mechanicProfileId: acceptedBid.mechanicProfile.id })}
                  disabled={submitReview.isPending || !reviewText.trim()}
                  className="bg-brand-orange text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  {submitReview.isPending ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="border px-6 py-2 rounded-lg text-sm text-gray-500"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <div className="flex gap-3 items-center">
                      <Link href={`/mechanic/${bid.mechanicProfile.id}`} className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-sm hover:opacity-80">
                        {bid.mechanicProfile.businessName.charAt(0)}
                      </Link>
                      <div>
                        <Link href={`/mechanic/${bid.mechanicProfile.id}`} className="font-semibold hover:text-brand-teal">
                          {bid.mechanicProfile.businessName}
                          {bid.mechanicProfile.verified && <span className="text-brand-teal ml-1">&#10003;</span>}
                        </Link>
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

                  <div className="flex gap-2">
                    {bid.status === "pending" && job.status !== "accepted" && job.status !== "completed" && (
                      <button
                        onClick={() => acceptBid.mutate(bid.id)}
                        disabled={acceptBid.isPending}
                        className="flex-1 bg-brand-orange text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                      >
                        {acceptBid.isPending ? "Accepting..." : "Accept This Bid"}
                      </button>
                    )}

                    {bid.status !== "rejected" && bid.status !== "withdrawn" && (
                      <button
                        onClick={() => startConversation.mutate(bid.mechanicId)}
                        disabled={startConversation.isPending}
                        className="border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Message
                      </button>
                    )}
                  </div>

                  {bid.status === "accepted" && (
                    <div className="text-center text-green-600 font-semibold text-sm py-2 mt-2">
                      &#10003; Bid Accepted
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
