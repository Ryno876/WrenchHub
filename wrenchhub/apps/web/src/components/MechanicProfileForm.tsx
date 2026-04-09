"use client";

import { useState } from "react";
import type { MechanicProfile, ServiceType } from "@wrenchhub/shared";
import { PhotoUpload } from "./PhotoUpload";

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

const CERTIFICATION_OPTIONS = [
  "ASE Certified",
  "ASE Master Technician",
  "EPA 608 Certified",
  "Honda Specialist",
  "Toyota Specialist",
  "Ford Specialist",
  "GM Specialist",
  "BMW Specialist",
  "Mercedes Specialist",
  "Diesel Certified",
  "Hybrid/EV Certified",
  "I-CAR Certified",
];

const EXPERIENCE_OPTIONS = [
  { value: 0, label: "Less than 1 year" },
  { value: 1, label: "1 year" },
  { value: 2, label: "2 years" },
  { value: 3, label: "3 years" },
  { value: 5, label: "5 years" },
  { value: 7, label: "7 years" },
  { value: 10, label: "10 years" },
  { value: 15, label: "15 years" },
  { value: 20, label: "20 years" },
  { value: 25, label: "25+ years" },
  { value: 30, label: "30+ years" },
];

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, 30, 50, 75, 100];

const LOCATION_OPTIONS = [
  "Miami, FL",
  "Fort Lauderdale, FL",
  "West Palm Beach, FL",
  "Hollywood, FL",
  "Pembroke Pines, FL",
  "Coral Springs, FL",
  "Hialeah, FL",
  "Boca Raton, FL",
  "Deerfield Beach, FL",
  "Pompano Beach, FL",
  "Davie, FL",
  "Plantation, FL",
  "Sunrise, FL",
  "Miramar, FL",
  "Homestead, FL",
  "Boynton Beach, FL",
  "Delray Beach, FL",
  "Doral, FL",
  "Aventura, FL",
  "Weston, FL",
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
    photos: string[];
    profilePhoto: string | null;
  }) => Promise<void>;
}

export function MechanicProfileForm({ initialData, onSubmit }: Props) {
  const [businessName, setBusinessName] = useState(
    initialData?.businessName || ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [customLocation, setCustomLocation] = useState("");
  const [serviceAreaRadius, setServiceAreaRadius] = useState(
    initialData?.serviceAreaRadius || 15
  );
  const [serviceType, setServiceType] = useState<ServiceType>(
    (initialData?.serviceType as ServiceType) || "shop"
  );
  const [services, setServices] = useState<string[]>(
    initialData?.services || []
  );
  const [certifications, setCertifications] = useState<string[]>(
    initialData?.certifications || []
  );
  const [yearsExperience, setYearsExperience] = useState(
    initialData?.yearsExperience || 0
  );
  const [about, setAbout] = useState(initialData?.about || "");
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [profilePhoto, setProfilePhoto] = useState<string[]>(
    initialData?.profilePhoto ? [initialData.profilePhoto] : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleCertification = (c: string) => {
    setCertifications((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const showCustomLocation = location === "__other";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        businessName,
        location: showCustomLocation ? customLocation : location,
        serviceAreaRadius,
        serviceType,
        services,
        certifications,
        yearsExperience,
        photos,
        profilePhoto: profilePhoto[0] || null,
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
          <select
            value={LOCATION_OPTIONS.includes(location) ? location : (location && location !== "__other" ? "__other" : location)}
            onChange={(e) => {
              setLocation(e.target.value);
              if (e.target.value !== "__other") setCustomLocation("");
            }}
            className="w-full border rounded-lg px-4 py-2 text-sm bg-white"
            required={!showCustomLocation}
          >
            <option value="">Select city...</option>
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
            <option value="__other">Other (type manually)</option>
          </select>
          {showCustomLocation && (
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Enter your city, state"
              className="w-full border rounded-lg px-4 py-2 text-sm mt-2"
              required
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Radius
          </label>
          <select
            value={serviceAreaRadius}
            onChange={(e) => setServiceAreaRadius(Number(e.target.value))}
            className="w-full border rounded-lg px-4 py-2 text-sm bg-white"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} miles
              </option>
            ))}
          </select>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Years of Experience
        </label>
        <select
          value={yearsExperience}
          onChange={(e) => setYearsExperience(Number(e.target.value))}
          className="w-full border rounded-lg px-4 py-2 text-sm bg-white"
        >
          {EXPERIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications
        </label>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATION_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCertification(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                certifications.includes(c)
                  ? "bg-brand-orange text-white border-brand-orange"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
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

      <PhotoUpload
        photos={profilePhoto}
        onChange={setProfilePhoto}
        maxPhotos={1}
        label="Profile Photo"
      />

      <PhotoUpload
        photos={photos}
        onChange={setPhotos}
        maxPhotos={10}
        label="Shop / Work Photos"
      />

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
