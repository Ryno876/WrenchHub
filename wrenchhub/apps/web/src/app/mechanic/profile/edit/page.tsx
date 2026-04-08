"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { MechanicProfileForm } from "@/components/MechanicProfileForm";
import type { MechanicProfile, MechanicProfileInput } from "@wrenchhub/shared";

export default function MechanicProfileEditPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "mechanic")) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["mechanic-profile"],
    queryFn: () =>
      apiFetch<MechanicProfile>("/api/mechanics/profile").catch(() => null),
    enabled: !!user,
  });

  const saveProfile = useMutation({
    mutationFn: (data: MechanicProfileInput) =>
      apiFetch<MechanicProfile>("/api/mechanics/profile", {
        method: profile ? "PUT" : "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanic-profile"] });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">
          {profile ? "Edit Your Profile" : "Set Up Your Profile"}
        </h1>
        <div className="bg-white rounded-2xl border p-6">
          <MechanicProfileForm
            initialData={profile || undefined}
            onSubmit={async (data) => {
              await saveProfile.mutateAsync(data);
            }}
          />
        </div>
      </div>
    </div>
  );
}
