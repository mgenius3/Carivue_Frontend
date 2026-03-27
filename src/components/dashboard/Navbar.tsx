"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, User, Settings, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { logoutUser } from "@/lib/auth";

interface NavbarProps {
  title: string;
  role?: string;
  userName?: string;
  orgName?: string;
  onAddOrg?: () => void;
}

export function Navbar({ 
  title = "Executive Dashboard", 
  role = "Executive", 
  userName,
  orgName,
  onAddOrg
}: NavbarProps) {
  const router = useRouter();
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const orgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayOrgName = orgName || "Your Organisation";
  const displayUserName = userName || "Your Profile";
  const userInitial = displayUserName.charAt(0).toUpperCase();

  return (
    <nav className="h-16 bg-transparent absolute top-0 right-0 left-0 z-40">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium text-gray-400">{title}</h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-400 hover:text-primary transition-colors focus:outline-none">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Organization Selector Dropdown */}
          <div className="relative" ref={orgRef}>
            <div 
              className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-all"
              onClick={() => setIsOrgOpen(!isOrgOpen)}
            >
              <span className="text-sm font-medium text-primary">{displayOrgName}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOrgOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOrgOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-up z-50">
                <div className="px-4 py-2 bg-[#1F3A4A]/5 border-l-4 border-[#1F3A4A]">
                  <span className="text-sm font-bold text-[#1F3A4A]">{displayOrgName}</span>
                </div>
                <div className="border-t border-gray-50 my-1"></div>
                <div 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2 text-secondary"
                  onClick={() => {
                    setIsOrgOpen(false);
                    onAddOrg?.();
                  }}
                >
                  <Plus size={14} />
                  <span className="text-sm font-bold">+ Add New Organisation</span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                {userInitial}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-primary group-hover:text-secondary transition-colors leading-tight">{displayUserName}</p>
                <p className="text-[10px] text-gray-400">Role: <span className="font-semibold">{role}</span></p>
              </div>
              <ChevronDown size={14} className={`text-gray-400 group-hover:text-primary transition-colors ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-up z-50">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                  <User size={16} />
                  View Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                  <Settings size={16} />
                  Account Settings
                </Link>
                <div className="border-t border-gray-50 my-1"></div>
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logoutUser(router);
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
