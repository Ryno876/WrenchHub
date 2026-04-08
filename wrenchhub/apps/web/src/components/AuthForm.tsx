"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@wrenchhub/shared";

interface Props {
  mode: "login" | "register";
}

export function AuthForm({ mode }: Props) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("car_owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {mode === "register" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("car_owner")}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition ${
                  role === "car_owner"
                    ? "border-brand-orange bg-orange-50 text-brand-orange"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Car Owner
              </button>
              <button
                type="button"
                onClick={() => setRole("mechanic")}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition ${
                  role === "mechanic"
                    ? "border-brand-teal bg-teal-50 text-brand-teal"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                Mechanic
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none"
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-orange text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "Please wait..."
          : mode === "register"
            ? "Create Account"
            : "Sign In"}
      </button>
    </form>
  );
}
