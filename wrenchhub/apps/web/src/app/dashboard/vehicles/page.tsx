"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleForm } from "@/components/VehicleForm";
import type { Vehicle } from "@wrenchhub/shared";

export default function VehiclesPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => apiFetch<Vehicle[]>("/api/vehicles"),
  });

  const addVehicle = useMutation({
    mutationFn: (data: {
      year: number;
      make: string;
      model: string;
      mileage: number;
    }) =>
      apiFetch<Vehicle>("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowForm(false);
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-500">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Vehicles</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            + Add Vehicle
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <VehicleForm
            onSubmit={async (data) => {
              await addVehicle.mutateAsync(data);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">No vehicles yet</p>
          <p className="text-sm">
            Add your first vehicle to get started posting jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onDelete={(id) => deleteVehicle.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
