"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface MechanicListing {
  id: string;
  businessName: string;
  location: string;
  serviceAreaRadius: number;
  serviceType: string;
  services: string[];
  certifications: string[];
  yearsExperience: number;
  profilePhoto: string | null;
  verified: boolean;
  about: string;
  user: { name: string; createdAt: string };
}

export default function BrowseMechanicsPage() {
  const [serviceFilter, setServiceFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: mechanics = [], isLoading } = useQuery({
    queryKey: ["browse-mechanics", serviceFilter, serviceTypeFilter, locationFilter, verifiedOnly],
    queryFn: () => {
      const params = new URLSearchParams();
      if (serviceFilter) params.set("service", serviceFilter);
      if (serviceTypeFilter) params.set("serviceType", serviceTypeFilter);
      if (locationFilter) params.set("location", locationFilter);
      if (verifiedOnly) params.set("verified", "true");
      return apiFetch<MechanicListing[]>(`/api/mechanics/browse?${params}`);
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Browse Mechanics</h1>
        <p className="text-gray-500 text-sm mb-6">Find verified mechanics near you</p>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Services</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Brakes & Rotors">Brakes & Rotors</option>
            <option value="Engine Repair">Engine Repair</option>
            <option value="Transmission">Transmission</option>
            <option value="Diagnostics">Diagnostics</option>
            <option value="Electrical">Electrical</option>
            <option value="A/C Service">A/C Service</option>
            <option value="Suspension">Suspension</option>
            <option value="Body Work">Body Work</option>
            <option value="Tire Service">Tire Service</option>
          </select>
          <select value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Mobile & Shop</option>
            <option value="mobile">Mobile Only</option>
            <option value="shop">Shop Only</option>
          </select>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter by city..."
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
              verifiedOnly ? "border-brand-teal bg-teal-50 text-brand-teal" : "border-gray-300 text-gray-500"
            }`}
          >
            ✓ Verified Only
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading mechanics...</p>
        ) : mechanics.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <p className="text-lg mb-1">No mechanics found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mechanics.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border p-5">
                <div className="flex gap-4 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-teal to-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {m.businessName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {m.businessName}
                      {m.verified && <span className="text-brand-teal ml-1 text-sm">✓ Verified</span>}
                    </div>
                    <div className="text-sm text-gray-500">📍 {m.location}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {m.serviceType === "both" ? "Mobile & Shop" : m.serviceType} &bull; {m.yearsExperience}yr exp &bull; {m.serviceAreaRadius}mi radius
                    </div>
                  </div>
                </div>

                {m.about && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{m.about}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {m.services.slice(0, 5).map((s) => (
                    <span key={s} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{s}</span>
                  ))}
                  {m.services.length > 5 && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-400">+{m.services.length - 5} more</span>
                  )}
                </div>

                {m.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {m.certifications.map((c) => (
                      <span key={c} className="bg-orange-50 text-brand-orange px-2 py-1 rounded text-xs font-medium">{c}</span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/mechanic/${m.id}`}
                  className="block w-full text-center bg-brand-teal text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
