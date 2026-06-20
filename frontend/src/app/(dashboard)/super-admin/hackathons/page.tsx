"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";

export default function SuperAdminHackathonsPage() {
  const { data: hackathons, isLoading } = useQuery({
    queryKey: ["allHackathons"],
    queryFn: () => api.get("/admin/hackathons/all").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading hackathons...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900">All Hackathons</h1>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-500">Title</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(hackathons || []).map((h: any) => (
              <tr key={h._id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{h.title}</td>
                <td className="p-4">{h.status}</td>
                <td className="p-4">{h.verificationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/super-admin/pending" className="text-indigo-600 font-bold hover:underline">
        Review pending verifications →
      </Link>
    </div>
  );
}
