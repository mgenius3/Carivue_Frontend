"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  MapPin, 
  FileText, 
  Settings, 
  LifeBuoy, 
  LogOut 
} from "lucide-react";
import { CarivueLogo } from "@/components/ui/CarivueLogo";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  role?: "executive" | "manager";
}

export function Sidebar({ role = "executive" }: SidebarProps) {
  const pathname = usePathname();
  const dashboardHref = role === "executive" ? "/dashboard/executive" : "/dashboard/manager";
  
  const navItems = [
    { name: "Dashboard", href: dashboardHref, icon: LayoutGrid },
    { name: "Sites", href: "/dashboard/sites", icon: MapPin },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Help & Support", href: "/dashboard/help", icon: LifeBuoy },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6">
        <CarivueLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                isActive 
                  ? "bg-[#1F3A4A]/5 text-[#1F3A4A]" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <Icon size={18} className={cn("transition-colors", isActive ? "text-[#1F3A4A]" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100 mb-8">
        <button 
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-[#E05B5B] hover:bg-red-50 rounded-lg transition-colors"
          onClick={() => console.log("Logout")}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
