"use client";

import type { Vehicle } from "@wrenchhub/shared";

interface Props {
  vehicle: Vehicle;
  onDelete: (id: string) => void;
}

export function VehicleCard({ vehicle, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
      <div>
        <h3 className="font-bold text-lg">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500">
          {vehicle.mileage.toLocaleString()} miles
        </p>
      </div>
      <button
        onClick={() => onDelete(vehicle.id)}
        className="text-red-500 text-sm hover:text-red-700"
      >
        Remove
      </button>
    </div>
  );
}
