"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Search, ClipboardList, Users, Folder, Trophy, MessageCircle, 
  Calendar, PlusCircle, FileText, UserCheck, BarChart, Megaphone, PieChart, 
  History, User, Clock, BarChart2, Settings 
} from "lucide-react";

const links = {
  participant: [
    { name: "Dashboard", href: "/participant", icon: LayoutDashboard },
    { name: "Browse Hackathons", href: "/participant/hackathons", icon: Search },
    { name: "My Registrations", href: "/participant/registrations", icon: ClipboardList },
    { name: "My Teams", href: "/participant/teams", icon: Users },
    { name: "Certificates", href: "/participant/certificates", icon: FileText },
  ],
  organizer: [
    { name: "Dashboard", href: "/organizer", icon: LayoutDashboard },
    { name: "My Hackathons", href: "/organizer/hackathons", icon: Calendar },
    { name: "Create Hackathon", href: "/organizer/hackathons/create", icon: PlusCircle },
  ],
  judge: [
    { name: "Dashboard", href: "/judge", icon: LayoutDashboard },
    { name: "My Assignments", href: "/judge/assignments", icon: ClipboardList },
    { name: "History", href: "/judge/history", icon: History },
  ],
  super_admin: [
    { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { name: "Users", href: "/super-admin/users", icon: Users },
    { name: "Hackathons", href: "/super-admin/hackathons", icon: Calendar },
    { name: "Pending Verifications", href: "/super-admin/pending", icon: Clock },
  ]
};

export default function Sidebar({ role, collapsed }: { role: string, collapsed: boolean }) {
  const pathname = usePathname();
  // @ts-ignore
  const roleLinks = links[role] || [];

  return (
    <aside className={`bg-gray-900 text-gray-300 transition-all duration-300 flex flex-col h-full ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-center border-b border-gray-800 h-16">
        {collapsed ? (
          <span className="font-black text-xl text-indigo-500">FJ</span>
        ) : (
          <span className="font-black text-xl text-white tracking-wider">FAIRJUDGE</span>
        )}
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        {roleLinks.map((link: any) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== `/${role}`);
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center px-4 py-3 mx-2 rounded-xl transition ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-gray-800 hover:text-white'}`}
              title={collapsed ? link.name : undefined}
            >
              <Icon className={`${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-white' : 'text-gray-400'}`} size={20} />
              {!collapsed && <span className="font-medium text-sm">{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        {!collapsed ? (
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{role.replace("_", " ")}</span>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto bg-gray-800 rounded-lg flex items-center justify-center">
             <span className="text-xs font-bold text-gray-400 uppercase">{role.charAt(0)}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
