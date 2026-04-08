"use client";

import { useState } from "react";

interface Props {
  onSubmit: (data: {
    year: number;
    make: string;
    model: string;
    mileage: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ onSubmit, onCancel }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ year, make, model, mileage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-5 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mileage
          </label>
          <input
            type="number"
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Honda"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Accord"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-orange text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Vehicle"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border px-6 py-2 rounded-lg text-sm text-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
