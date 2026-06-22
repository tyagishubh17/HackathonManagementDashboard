"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BarChart3 } from "lucide-react";

export default function SuperAdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: () => api.get("/admin/analytics/overview").then((res: any) => res.data.data),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
        <BarChart3 className="text-indigo-600" /> Platform Analytics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-black text-indigo-600">{analytics?.totalUsers ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Active Hackathons</p>
          <p className="text-3xl font-black text-green-600">{analytics?.activeHackathons ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Pending Verifications</p>
          <p className="text-3xl font-black text-yellow-600">{analytics?.pendingVerifications ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
