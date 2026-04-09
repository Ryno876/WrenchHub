"use client";

import { useState } from "react";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear + 1 - i);

const MAKES_AND_MODELS: Record<string, string[]> = {
  Acura: ["ILX", "Integra", "MDX", "RDX", "TLX"],
  Audi: ["A3", "A4", "A5", "A6", "Q3", "Q5", "Q7", "Q8"],
  BMW: ["2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X5", "X7"],
  Buick: ["Enclave", "Encore", "Envision"],
  Cadillac: ["CT4", "CT5", "Escalade", "XT4", "XT5", "XT6"],
  Chevrolet: ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado", "Suburban", "Tahoe", "Trailblazer", "Traverse"],
  Chrysler: ["300", "Pacifica"],
  Dodge: ["Challenger", "Charger", "Durango", "Hornet"],
  Ford: ["Bronco", "Edge", "Escape", "Explorer", "F-150", "Maverick", "Mustang", "Ranger"],
  Genesis: ["G70", "G80", "G90", "GV70", "GV80"],
  GMC: ["Acadia", "Canyon", "Sierra", "Terrain", "Yukon"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  Hyundai: ["Elantra", "Ioniq", "Kona", "Palisade", "Santa Fe", "Sonata", "Tucson", "Venue"],
  Infiniti: ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"],
  Jeep: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler"],
  Kia: ["Carnival", "EV6", "Forte", "K5", "Seltos", "Sorento", "Soul", "Sportage", "Telluride"],
  Lexus: ["ES", "GX", "IS", "LX", "NX", "RX", "TX", "UX"],
  Lincoln: ["Aviator", "Corsair", "Nautilus", "Navigator"],
  Mazda: ["CX-30", "CX-5", "CX-50", "CX-90", "Mazda3", "MX-5 Miata"],
  Mercedes: ["A-Class", "C-Class", "E-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "S-Class"],
  Mitsubishi: ["Eclipse Cross", "Mirage", "Outlander"],
  Nissan: ["Altima", "Armada", "Frontier", "Kicks", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Ram: ["1500", "2500", "3500"],
  Subaru: ["Ascent", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Toyota: ["4Runner", "Camry", "Corolla", "GR86", "Highlander", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza"],
  Volkswagen: ["Atlas", "Golf", "ID.4", "Jetta", "Taos", "Tiguan"],
  Volvo: ["S60", "S90", "V60", "XC40", "XC60", "XC90"],
  Other: [],
};

const MAKES = Object.keys(MAKES_AND_MODELS);

interface Props {
  onSubmit: (data: {
    vin?: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    mileage: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({ onSubmit, onCancel }: Props) {
  const [mode, setMode] = useState<"vin" | "manual">("vin");
  const [vin, setVin] = useState("");
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");
  const [vinDecoded, setVinDecoded] = useState(false);

  const [year, setYear] = useState(currentYear);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [mileage, setMileage] = useState(0);
  const [loading, setLoading] = useState(false);

  const models = make ? MAKES_AND_MODELS[make] || [] : [];
  const showCustomModel = make === "Other" || (make && models.length === 0) || model === "__other";

  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    setModel("");
    setCustomModel("");
    setTrim("");
  };

  const lookupVin = async () => {
    if (vin.length !== 17) {
      setVinError("VIN must be exactly 17 characters");
      return;
    }

    setVinLoading(true);
    setVinError("");

    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );
      const data = await res.json();

      const results = data.Results as Array<{ Variable: string; Value: string | null }>;
      const getValue = (variable: string) =>
        results.find((r) => r.Variable === variable)?.Value || "";

      const decodedYear = getValue("Model Year");
      const decodedMake = getValue("Make");
      const decodedModel = getValue("Model");
      const decodedTrim = getValue("Trim");

      if (!decodedMake || !decodedModel) {
        setVinError("Could not decode this VIN. Try entering manually.");
        return;
      }

      setYear(parseInt(decodedYear) || currentYear);
      setMake(decodedMake);
      setModel(decodedModel);
      setCustomModel(decodedModel);
      setTrim(decodedTrim);
      setVinDecoded(true);
    } catch {
      setVinError("Failed to look up VIN. Check your connection and try again.");
    } finally {
      setVinLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        vin: vin || undefined,
        year,
        make,
        model: showCustomModel ? customModel : model,
        trim: trim || undefined,
        mileage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-5 space-y-4"
    >
      {/* Mode toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => { setMode("vin"); setVinDecoded(false); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition ${
            mode === "vin"
              ? "border-brand-orange bg-orange-50 text-brand-orange"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Enter VIN
        </button>
        <button
          type="button"
          onClick={() => { setMode("manual"); setVinDecoded(false); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition ${
            mode === "manual"
              ? "border-brand-orange bg-orange-50 text-brand-orange"
              : "border-gray-200 text-gray-500"
          }`}
        >
          Enter Manually
        </button>
      </div>

      {/* VIN input */}
      {mode === "vin" && !vinDecoded && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Identification Number (VIN)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Find your VIN on the driver-side dashboard, door jamb, or registration
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""))}
              placeholder="e.g. 1HGCV1F34LA000001"
              maxLength={17}
              className="flex-1 border rounded-lg px-4 py-2 text-sm font-mono tracking-wider"
            />
            <button
              type="button"
              onClick={lookupVin}
              disabled={vinLoading || vin.length !== 17}
              className="bg-brand-orange text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {vinLoading ? "Looking up..." : "Decode"}
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">{vin.length}/17 characters</div>
          {vinError && (
            <div className="text-red-500 text-sm mt-2">{vinError}</div>
          )}
        </div>
      )}

      {/* Decoded VIN success */}
      {mode === "vin" && vinDecoded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 text-lg">&#10003;</span>
            <span className="font-semibold text-green-700">VIN Decoded Successfully</span>
          </div>
          <div className="text-sm text-gray-700">
            <strong>{year} {make} {model}</strong>
            {trim && <span className="text-gray-500"> {trim}</span>}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-1">VIN: {vin}</div>
          <button
            type="button"
            onClick={() => setVinDecoded(false)}
            className="text-xs text-brand-orange mt-2 hover:underline"
          >
            Edit details
          </button>
        </div>
      )}

      {/* Manual fields (shown in manual mode OR after VIN decode to allow editing) */}
      {(mode === "manual" || (mode === "vin" && !vinDecoded && vin.length === 0)) && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                required
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <select
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                required
              >
                <option value="">Select make...</option>
                {MAKES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              {showCustomModel ? (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Enter model"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  required
                  disabled={!make}
                >
                  <option value="">{make ? "Select model..." : "Select make first"}</option>
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="__other">Other (type manually)</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trim <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
                placeholder="e.g. Sport, EX-L, Limited"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </>
      )}

      {/* Mileage (always shown) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
        <input
          type="number"
          value={mileage || ""}
          onChange={(e) => setMileage(Number(e.target.value))}
          placeholder="45000"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || (!make && !vinDecoded)}
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
