"use client";

import type { Vehicle } from "@wrenchhub/shared";

interface VehicleWithTrim extends Vehicle {
  trim?: string | null;
  vin?: string | null;
}

interface Props {
  vehicle: VehicleWithTrim;
  onDelete: (id: string) => void;
}

export function VehicleCard({ vehicle, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
      <div>
        <h3 className="font-bold text-lg">
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.trim && <span className="text-gray-500 font-normal"> {vehicle.trim}</span>}
        </h3>
        <p className="text-sm text-gray-500">
          {vehicle.mileage.toLocaleString()} miles
          {vehicle.vin && <span> &bull; VIN: {vehicle.vin.slice(-6)}</span>}
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
