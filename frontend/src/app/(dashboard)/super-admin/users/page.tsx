"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SuperAdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => api.get("/admin/users").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900">User Management</h1>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-500">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Role</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
