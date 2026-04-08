"use client";

import { useState } from "react";
import type { MechanicProfile, ServiceType } from "@wrenchhub/shared";

const SERVICE_OPTIONS = [
  "Oil Change",
  "Brakes & Rotors",
  "Engine Repair",
  "Transmission",
  "Diagnostics",
  "Electrical",
  "A/C Service",
  "Suspension",
  "Exhaust",
  "Tire Service",
  "Body Work",
  "Paint",
];

interface Props {
  initialData?: MechanicProfile;
  onSubmit: (data: {
    businessName: string;
    location: string;
    serviceAreaRadius: number;
    serviceType: ServiceType;
    services: string[];
    certifications: string[];
    yearsExperience: number;
    about: string;
  }) => Promise<void>;
}

export function MechanicProfileForm({ initialData, onSubmit }: Props) {
  const [businessName, setBusinessName] = useState(
    initialData?.businessName || ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [serviceAreaRadius, setServiceAreaRadius] = useState(
    initialData?.serviceAreaRadius || 15
  );
  const [serviceType, setServiceType] = useState<ServiceType>(
    (initialData?.serviceType as ServiceType) || "shop"
  );
  const [services, setServices] = useState<string[]>(
    initialData?.services || []
  );
  const [certifications, setCertifications] = useState(
    initialData?.certifications?.join(", ") || ""
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialData?.yearsExperience || 0
  );
  const [about, setAbout] = useState(initialData?.about || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        businessName,
        location,
        serviceAreaRadius,
        serviceType,
        services,
        certifications: certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        yearsExperience,
        about,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Name
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Fort Lauderdale, FL"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Radius (miles)
          </label>
          <input
            type="number"
            value={serviceAreaRadius}
            onChange={(e) => setServiceAreaRadius(Number(e.target.value))}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            min={1}
            max={100}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <div className="flex gap-3">
          {(["shop", "mobile", "both"] as ServiceType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setServiceType(type)}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 capitalize transition ${
                serviceType === type
                  ? "border-brand-teal bg-teal-50 text-brand-teal"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              {type === "both" ? "Both" : type === "mobile" ? "Mobile" : "Shop"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Offered
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleService(s)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                services.includes(s)
                  ? "bg-brand-teal text-white border-brand-teal"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="number"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(Number(e.target.value))}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certifications (comma-separated)
          </label>
          <input
            type="text"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="ASE Certified, Honda Specialist"
            className="w-full border rounded-lg px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About Your Business
        </label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-4 py-2 text-sm"
          maxLength={1000}
          placeholder="Tell car owners about your shop, experience, and what makes you different..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? "Saving..." : initialData ? "Update Profile" : "Create Profile"}
      </button>
    </form>
  );
}
