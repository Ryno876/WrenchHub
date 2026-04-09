"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { Vehicle } from "@wrenchhub/shared";

const CATEGORIES = [
  { value: "maintenance", label: "Maintenance", description: "Oil change, tire rotation, brake pads, fluid flush" },
  { value: "repair", label: "Repair", description: "Engine, transmission, electrical, suspension, exhaust" },
  { value: "diagnostics", label: "Diagnostics", description: "Check engine light, unusual noises, performance issues" },
  { value: "body_work", label: "Body Work", description: "Dents, paint, bumper repair, glass" },
  { value: "other", label: "Other", description: "Anything not listed above" },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  maintenance: ["Oil Change", "Tire Rotation", "Brake Pads", "Fluid Flush", "Spark Plugs", "Filter Replacement", "Belt Replacement", "Battery", "Other"],
  repair: ["Engine", "Transmission", "Electrical", "Suspension", "Exhaust", "Cooling System", "Fuel System", "Steering", "Other"],
  diagnostics: ["Check Engine Light", "Unusual Noise", "Performance Issue", "Vibration", "Warning Light", "Other"],
  body_work: ["Dent Repair", "Paint", "Bumper", "Glass/Windshield", "Rust Repair", "Other"],
  other: [],
};

export default function NewJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form state
  const [vehicleId, setVehicleId] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceTypePreference, setServiceTypePreference] = useState("no_preference");
  const [urgency, setUrgency] = useState("flexible");
  const [location, setLocation] = useState(user?.location || "");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    title: string;
    description: string;
    suggestedCategory: string;
    keyDetails: string[];
  } | null>(null);

  const getVehicleInfo = () => {
    const v = vehicles.find((v) => v.id === vehicleId);
    return v ? `${v.year} ${v.make} ${v.model}` : "";
  };

  const handleAiAssist = async () => {
    if (!description.trim()) return;
    setAiLoading(true);
    try {
      const result = await apiFetch<{
        title: string;
        description: string;
        suggestedCategory: string;
        keyDetails: string[];
      }>("/api/ai/assist-job", {
        method: "POST",
        body: JSON.stringify({
          description,
          category,
          vehicleInfo: getVehicleInfo(),
        }),
      });
      setAiSuggestion(result);
    } catch {
      // Silently fail — AI assist is optional
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setTitle(aiSuggestion.title);
    setDescription(aiSuggestion.description);
    setAiSuggestion(null);
  };

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => apiFetch<Vehicle[]>("/api/vehicles"),
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          vehicleId,
          title,
          description,
          category,
          subCategory: subCategory || undefined,
          photos,
          serviceTypePreference,
          urgency,
          location,
        }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Post a Job</h1>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s < step ? "bg-brand-teal text-white" :
                s === step ? "bg-brand-orange text-white" :
                "bg-gray-200 text-gray-500"
              }`}>
                {s < step ? "\u2713" : s}
              </div>
              <span className={`text-xs hidden sm:block ${s === step ? "text-brand-orange font-semibold" : "text-gray-400"}`}>
                {s === 1 ? "Vehicle" : s === 2 ? "Category" : s === 3 ? "Details" : "Review"}
              </span>
              {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? "bg-brand-teal" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <div className="bg-white rounded-2xl border p-6">
          {/* Step 1: Select Vehicle */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Which vehicle needs work?</h2>
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You need to add a vehicle first.</p>
                  <button onClick={() => router.push("/dashboard/vehicles")} className="bg-brand-orange text-white px-6 py-2 rounded-lg font-semibold">
                    Add a Vehicle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setVehicleId(v.id); setStep(2); }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        vehicleId === v.id ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-bold">{v.year} {v.make} {v.model}</div>
                      <div className="text-sm text-gray-500">{v.mileage.toLocaleString()} miles</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">What type of service?</h2>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => { setCategory(cat.value); setSubCategory(""); setStep(3); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      category === cat.value ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-bold">{cat.label}</div>
                    <div className="text-sm text-gray-500">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Describe what you need</h2>

              {SUB_CATEGORIES[category]?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific service</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 text-sm bg-white"
                  >
                    <option value="">Select...</option>
                    {SUB_CATEGORIES[category].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Brake Pad Replacement"
                  className="w-full border rounded-lg px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the problem or what you need done..."
                  className="w-full border rounded-lg px-4 py-2 text-sm"
                />
                {description.trim().length >= 10 && !aiSuggestion && (
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={aiLoading}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>&#129302;</span>
                    {aiLoading ? "Analyzing..." : "AI: Help me describe this better"}
                  </button>
                )}
              </div>

              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">&#129302;</span>
                    <span className="font-bold text-sm text-indigo-700">AI Suggestion</span>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-500">Suggested title:</div>
                    <div className="font-semibold text-sm">{aiSuggestion.title}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-500">Improved description:</div>
                    <div className="text-sm text-gray-700">{aiSuggestion.description}</div>
                  </div>
                  {aiSuggestion.keyDetails.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500">Key details for mechanics:</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {aiSuggestion.keyDetails.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={applyAiSuggestion}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
                    >
                      Use Suggestion
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion(null)}
                      className="text-sm text-gray-500 px-4 py-1.5"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={5}
                label="Photos of the issue"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Preference</label>
                <div className="flex gap-3">
                  {[
                    { value: "no_preference", label: "No Preference" },
                    { value: "mobile", label: "Mobile" },
                    { value: "shop", label: "Shop" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setServiceTypePreference(opt.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                        serviceTypePreference === opt.value
                          ? "border-brand-teal bg-teal-50 text-brand-teal"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                <div className="flex gap-3">
                  {[
                    { value: "flexible", label: "Flexible" },
                    { value: "within_a_week", label: "This Week" },
                    { value: "asap", label: "ASAP" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUrgency(opt.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                        urgency === opt.value
                          ? "border-brand-orange bg-orange-50 text-brand-orange"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Fort Lauderdale, FL"
                  className="w-full border rounded-lg px-4 py-2 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="border px-6 py-2 rounded-lg text-sm text-gray-500">Back</button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!title || !description || !location}
                  className="flex-1 bg-brand-orange text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review Your Job</h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Vehicle</div>
                  <div className="font-semibold">
                    {vehicles.find((v) => v.id === vehicleId)?.year}{" "}
                    {vehicles.find((v) => v.id === vehicleId)?.make}{" "}
                    {vehicles.find((v) => v.id === vehicleId)?.model}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="font-semibold capitalize">{category.replace("_", " ")}{subCategory ? ` — ${subCategory}` : ""}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Title</div>
                  <div className="font-semibold">{title}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Description</div>
                  <div className="text-sm text-gray-700">{description}</div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-xs text-gray-500">Service</div>
                    <div className="text-sm capitalize">{serviceTypePreference.replace("_", " ")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Urgency</div>
                    <div className="text-sm capitalize">{urgency.replace("_", " ")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-sm">{location}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)} className="border px-6 py-2 rounded-lg text-sm text-gray-500">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-brand-orange text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Post Job"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
