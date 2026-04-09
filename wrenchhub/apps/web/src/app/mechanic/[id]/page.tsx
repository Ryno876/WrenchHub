"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface MechanicProfileDetail {
  id: string;
  userId: string;
  businessName: string;
  location: string;
  serviceAreaRadius: number;
  serviceType: string;
  services: string[];
  certifications: string[];
  yearsExperience: number;
  photos: string[];
  profilePhoto: string | null;
  coverPhoto: string | null;
  verified: boolean;
  about: string;
  user: { name: string; email: string; createdAt: string };
}

interface ReviewData {
  reviews: Array<{
    id: string;
    rating: number;
    text: string;
    mechanicResponse: string | null;
    createdAt: string;
    reviewer: { name: string };
    job: { title: string; category: string };
  }>;
  avgRating: number;
  totalReviews: number;
}

export default function PublicMechanicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["mechanic-public", id],
    queryFn: () => apiFetch<MechanicProfileDetail>(`/api/mechanics/${id}`),
  });

  const { data: reviewData } = useQuery({
    queryKey: ["mechanic-reviews", id],
    queryFn: () => apiFetch<ReviewData>(`/api/reviews/mechanic/${id}`),
    enabled: !!id,
  });

  const startConversation = useMutation({
    mutationFn: () =>
      apiFetch<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ recipientId: profile?.userId }),
      }),
    onSuccess: (data) => {
      router.push(`/messages/${data.id}`);
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Mechanic not found</p></div>;
  }

  const stars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>&#9733;</span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-brand-dark via-indigo-900 to-brand-teal relative">
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:ml-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-teal to-teal-600 border-4 border-white flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {profile.businessName.charAt(0)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.businessName}
                  {profile.verified && <span className="text-brand-teal ml-2 text-lg">&#10003; Verified</span>}
                </h1>
                <p className="text-gray-500 text-sm">
                  {reviewData && reviewData.totalReviews > 0 && (
                    <span className="mr-2">
                      {stars(Math.round(reviewData.avgRating))} {reviewData.avgRating.toFixed(1)} ({reviewData.totalReviews} reviews)
                    </span>
                  )}
                </p>
                <p className="text-gray-500 text-sm">
                  📍 {profile.location} &bull; {profile.serviceAreaRadius}mi radius &bull;{" "}
                  {profile.serviceType === "both" ? "Mobile & Shop" : profile.serviceType} &bull; {profile.yearsExperience}yr exp
                </p>
              </div>
              {user && user.id !== profile.userId && (
                <button
                  onClick={() => startConversation.mutate()}
                  disabled={startConversation.isPending}
                  className="bg-brand-orange text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                >
                  {startConversation.isPending ? "..." : "Message"}
                </button>
              )}
            </div>

            {profile.about && (
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-2">About</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{profile.about}</p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-bold text-lg mb-2">Services</h2>
              <div className="flex flex-wrap gap-2">
                {profile.services.map((s) => (
                  <span key={s} className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm">{s}</span>
                ))}
              </div>
            </div>

            {profile.certifications.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-2">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((c) => (
                    <span key={c} className="bg-orange-50 text-brand-orange px-3 py-1.5 rounded-lg text-sm font-medium">
                      &#10003; {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-bold text-lg mb-4">
                Reviews {reviewData ? `(${reviewData.totalReviews})` : ""}
              </h2>
              {!reviewData || reviewData.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviewData.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-sm">{review.reviewer.name}</span>
                          <div className="text-sm">{stars(review.rating)}</div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                      <p className="text-xs text-gray-400">Job: {review.job.title}</p>
                      {review.mechanicResponse && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-3 border-l-3 border-brand-teal">
                          <p className="text-xs font-semibold text-brand-teal mb-1">{profile.businessName} replied:</p>
                          <p className="text-sm text-gray-600">{review.mechanicResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-bold text-sm mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-extrabold">{reviewData?.avgRating.toFixed(1) || "—"}</div>
                  <div className="text-xs text-gray-500">Average Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{reviewData?.totalReviews || 0}</div>
                  <div className="text-xs text-gray-500">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{profile.yearsExperience}</div>
                  <div className="text-xs text-gray-500">Years Experience</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-bold text-sm mb-2">Location</h3>
              <p className="text-sm text-gray-600">{profile.location}</p>
              <p className="text-xs text-gray-400">Serves {profile.serviceAreaRadius} mi radius</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
