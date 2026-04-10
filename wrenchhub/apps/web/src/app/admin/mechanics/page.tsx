"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AdminMechanic {
  id: string;
  businessName: string;
  location: string;
  serviceType: string;
  services: string[];
  certifications: string[];
  yearsExperience: number;
  verified: boolean;
  about: string;
  user: { id: string; name: string; email: string; createdAt: string };
  _count: { bids: number; reviews: number };
}

export default function AdminMechanicsPage() {
  const queryClient = useQueryClient();

  const { data: mechanics = [], isLoading } = useQuery({
    queryKey: ["admin-mechanics"],
    queryFn: () => apiFetch<AdminMechanic[]>("/api/admin/mechanics"),
  });

  const toggleVerify = useMutation({
    mutationFn: ({ profileId, verified }: { profileId: string; verified: boolean }) =>
      apiFetch(`/api/admin/mechanics/${profileId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verified }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-mechanics"] }),
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Mechanics ({mechanics.length})</h2>

      {isLoading ? (
        <p className="text-gray-500">Loading mechanics...</p>
      ) : mechanics.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          No mechanic profiles yet.
        </div>
      ) : (
        <div className="space-y-4">
          {mechanics.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {m.businessName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{m.businessName}</span>
                      {m.verified ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">VERIFIED</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">UNVERIFIED</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {m.user.name} &bull; {m.user.email} &bull; {m.location}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {m.serviceType} &bull; {m.yearsExperience}yr exp &bull; {m._count.bids} bids &bull; {m._count.reviews} reviews
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {m.services.map((s) => (
                        <span key={s} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{s}</span>
                      ))}
                    </div>
                    {m.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.certifications.map((c) => (
                          <span key={c} className="bg-orange-50 text-brand-orange px-2 py-0.5 rounded text-xs font-medium">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => toggleVerify.mutate({ profileId: m.id, verified: !m.verified })}
                    disabled={toggleVerify.isPending}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 ${
                      m.verified
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {m.verified ? "Remove Verification" : "Verify Mechanic"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
