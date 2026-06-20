"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const roles = [
  { label: "All Users", value: "" },
  { label: "Participants", value: "participant" },
  { label: "Organizers", value: "organizer" },
  { label: "Judges", value: "judge" },
  { label: "Super Admins", value: "super_admin" },
];

export default function SuperAdminUsersPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers", selectedRole],
    queryFn: () => api.get(`/admin/users${selectedRole ? `?role=${selectedRole}` : ''}`).then((res: any) => res.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/users/${editingUser._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      fullName: editingUser.fullName,
      email: editingUser.email,
      role: editingUser.role,
    });
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900">User Management</h1>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => setSelectedRole(role.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              selectedRole === role.value
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-500">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Role</th>
              <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(users || []).map((u: any) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{u.fullName}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this user?")) {
                        deleteMutation.mutate(u._id);
                      }
                    }}
                    className="text-red-600 hover:text-red-900 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="participant">Participant</option>
                  <option value="organizer">Organizer</option>
                  <option value="judge">Judge</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
