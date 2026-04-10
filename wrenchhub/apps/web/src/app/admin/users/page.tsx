"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  location: string | null;
  createdAt: string;
  _count: { jobs: number; bids: number; vehicles: number };
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      return apiFetch<AdminUser[]>(`/api/admin/users?${params}`);
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleAdmin = useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      apiFetch(`/api/admin/users/${id}/admin`, {
        method: "PATCH",
        body: JSON.stringify({ isAdmin }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-6">Users ({users.length})</h2>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Roles</option>
          <option value="car_owner">Car Owners</option>
          <option value="mechanic">Mechanics</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {user.name}
                      {user.isAdmin && (
                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">ADMIN</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === "mechanic" ? "bg-teal-100 text-teal-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user._count.jobs > 0 && <span>{user._count.jobs} jobs </span>}
                    {user._count.bids > 0 && <span>{user._count.bids} bids </span>}
                    {user._count.vehicles > 0 && <span>{user._count.vehicles} vehicles</span>}
                    {user._count.jobs === 0 && user._count.bids === 0 && user._count.vehicles === 0 && "No activity"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdmin.mutate({ id: user.id, isAdmin: !user.isAdmin })}
                        className={`text-xs px-3 py-1 rounded-lg font-medium ${
                          user.isAdmin
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                      >
                        {user.isAdmin ? "Remove Admin" : "Make Admin"}
                      </button>
                      {!user.isAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
                              deleteUser.mutate(user.id);
                            }
                          }}
                          className="text-xs px-3 py-1 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
