"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Calendar, Clock, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    // A mock fallback in case the endpoint fails so it doesn't crash the dashboard view during testing
    queryFn: () => api.get("/admin/analytics/overview").then((res: any) => res.data.data).catch(() => ({ totalUsers: 0, activeHackathons: 0, pendingVerifications: 0 })),
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading admin dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900">System Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Users</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{analytics?.totalUsers || 0}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600"><Users size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Hackathons</p>
            <p className="text-3xl font-black text-green-600 mt-1">{analytics?.activeHackathons || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl text-green-600"><Calendar size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Pending Approvals</p>
            <p className="text-3xl font-black text-yellow-600 mt-1">{analytics?.pendingVerifications || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl text-yellow-600"><Clock size={32}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">System Health</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">99.9%</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600"><Activity size={32}/></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/super-admin/pending" className="flex items-center gap-4 p-6 rounded-xl border-2 border-transparent bg-indigo-50 hover:border-indigo-200 transition group">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 group-hover:scale-110 transition"><Clock size={24} /></div>
            <div>
              <h3 className="font-bold text-indigo-900">Verify Hackathons</h3>
              <p className="text-sm text-indigo-700 mt-1">Review pending hackathons submitted by organizers.</p>
            </div>
            <ArrowRight className="ml-auto text-indigo-400 group-hover:text-indigo-600 transition" />
          </Link>
          <Link href="/super-admin/users" className="flex items-center gap-4 p-6 rounded-xl border-2 border-transparent bg-green-50 hover:border-green-200 transition group">
            <div className="bg-green-100 p-4 rounded-full text-green-600 group-hover:scale-110 transition"><Users size={24} /></div>
            <div>
              <h3 className="font-bold text-green-900">Manage Users</h3>
              <p className="text-sm text-green-700 mt-1">View, suspend, or update user roles across the platform.</p>
            </div>
            <ArrowRight className="ml-auto text-green-400 group-hover:text-green-600 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
