"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Layers 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Unified Organizer navigation links mapping grid
  const organizerNavItems = [
    {
      name: "Dashboard",
      href: "/organizer",
      icon: LayoutDashboard,
    },
    {
      name: "Evaluations",
      href: "/organizer/evaluations", // 🛡️ Points directly to the plural App Router folder target
      icon: ClipboardList,
    },
    {
      name: "Results & Matrix",
      href: "/organizer/results",
      icon: BarChart3,
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col min-h-screen border-r border-slate-800">
      
      {/* Brand Workspace Header Panel */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <Layers className="text-indigo-400" size={24} />
        <span className="font-black text-xl tracking-wider text-white uppercase">
          FairJudge
        </span>
      </div>

      {/* Navigation Router Action Grid List */}
      <nav className="flex-1 p-4 space-y-1.5">
        {organizerNavItems.map((item) => {
          // Explicit path validation rule keeping active route highlighted cleanly
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Tracking Context Block */}
      <div className="p-4 border-t border-slate-800 text-xs font-mono text-slate-500 text-center">
        Organizer Workspace v1.0
      </div>
    </aside>
  );
}
