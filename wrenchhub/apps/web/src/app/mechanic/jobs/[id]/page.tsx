"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  _count: { bids: number };
}

export default function MechanicJobDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [totalPrice, setTotalPrice] = useState(0);
  const [partsName, setPartsName] = useState("");
  const [partsCost, setPartsCost] = useState(0);
  const [partsList, setPartsList] = useState<Array<{ name: string; cost: number }>>([]);
  const [laborHours, setLaborHours] = useState(1);
  const [laborRate, setLaborRate] = useState(75);
  const [fees, setFees] = useState(0);
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availability, setAvailability] = useState("");
  const [error, setError] = useState("");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job-mechanic", id],
    queryFn: () => apiFetch<JobDetail>(`/api/jobs/${id}`),
  });

  const submitBid = useMutation({
    mutationFn: () => {
      const partsTotal = partsList.reduce((sum, p) => sum + p.cost, 0);
      const laborTotal = laborHours * laborRate;
      const total = partsTotal + laborTotal + fees;

      return apiFetch("/api/bids", {
        method: "POST",
        body: JSON.stringify({
          jobId: id,
          totalPrice: total,
          partsBreakdown: JSON.stringify(partsList),
          laborHours,
          laborRate,
          fees,
          estimatedCompletionTime,
          notes,
          availability,
        }),
      });
    },
    onSuccess: () => {
      router.push("/mechanic/jobs");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to submit bid");
    },
  });

  const addPart = () => {
    if (partsName && partsCost > 0) {
      setPartsList([...partsList, { name: partsName, cost: partsCost }]);
      setPartsName("");
      setPartsCost(0);
    }
  };

  const removePart = (index: number) => {
    setPartsList(partsList.filter((_, i) => i !== index));
  };

  const partsTotal = partsList.reduce((sum, p) => sum + p.cost, 0);
  const laborTotal = laborHours * laborRate;
  const calculatedTotal = partsTotal + laborTotal + fees;

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!job) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Job not found</p></div>;
  }

  const urgencyColors: Record<string, string> = {
    asap: "bg-red-100 text-red-700",
    within_a_week: "bg-yellow-100 text-yellow-700",
    flexible: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">&larr; Back to Jobs</button>

        {/* Job details */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-xl font-bold">{job.title}</h1>
              <p className="text-sm text-gray-500">
                {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} &bull; {job.vehicle.mileage.toLocaleString()} mi
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyColors[job.urgency]}`}>
              {job.urgency.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 mb-3">{job.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>📍 {job.location}</span>
            <span className="capitalize">🔧 {job.serviceTypePreference.replace("_", " ")}</span>
            <span>👤 {job.owner.name}</span>
          </div>
        </div>

        {/* Bid form */}
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-lg font-bold mb-4">Submit Your Bid</h2>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

          <div className="space-y-5">
            {/* Parts breakdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parts (itemized)</label>
              {partsList.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 mb-2 text-sm">
                  <span>{p.name}</span>
                  <div className="flex items-center gap-3">
                    <span>${p.cost.toFixed(2)}</span>
                    <button onClick={() => removePart(i)} className="text-red-500 text-xs">✕</button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" value={partsName} onChange={(e) => setPartsName(e.target.value)} placeholder="Part name" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <input type="number" value={partsCost || ""} onChange={(e) => setPartsCost(Number(e.target.value))} placeholder="Cost" className="w-24 border rounded-lg px-3 py-2 text-sm" />
                <button type="button" onClick={addPart} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold">Add</button>
              </div>
            </div>

            {/* Labor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
                <input type="number" value={laborHours} onChange={(e) => setLaborHours(Number(e.target.value))} min={0} step={0.5} className="w-full border rounded-lg px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input type="number" value={laborRate} onChange={(e) => setLaborRate(Number(e.target.value))} min={0} className="w-full border rounded-lg px-4 py-2 text-sm" />
              </div>
            </div>

            {/* Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Fees / Supplies ($)</label>
              <input type="number" value={fees} onChange={(e) => setFees(Number(e.target.value))} min={0} className="w-full border rounded-lg px-4 py-2 text-sm" />
            </div>

            {/* Estimated time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion Time</label>
              <select value={estimatedCompletionTime} onChange={(e) => setEstimatedCompletionTime(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-sm bg-white" required>
                <option value="">Select...</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
                <option value="2 days">2 days</option>
                <option value="3+ days">3+ days</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">When can you start?</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-sm bg-white">
                <option value="">Select...</option>
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This week">This week</option>
                <option value="Next week">Next week</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes to Car Owner</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any questions, clarifications, or additional info..." className="w-full border rounded-lg px-4 py-2 text-sm" />
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-1"><span>Parts</span><span>${partsTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-1"><span>Labor ({laborHours}hrs × ${laborRate})</span><span>${laborTotal.toFixed(2)}</span></div>
              {fees > 0 && <div className="flex justify-between text-sm mb-1"><span>Fees</span><span>${fees.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
                <span>Total</span>
                <span>${calculatedTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => submitBid.mutate()}
              disabled={submitBid.isPending || !estimatedCompletionTime || calculatedTotal <= 0}
              className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {submitBid.isPending ? "Submitting..." : `Submit Bid — $${calculatedTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
