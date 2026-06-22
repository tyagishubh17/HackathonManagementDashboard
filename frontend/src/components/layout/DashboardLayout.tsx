"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../../hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on actual role
        const rolePaths: Record<string, string> = {
          participant: "/participant",
          organizer: "/organizer/hackathons",
          judge: "/judge",
          super_admin: "/super-admin"
        };
        router.push(rolePaths[user?.role as string] || "/login");
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, user, pathname, router]);

  if (isLoading || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={user?.role as string} collapsed={collapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={() => setCollapsed(!collapsed)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
