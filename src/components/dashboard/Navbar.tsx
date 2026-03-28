"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, User, Settings, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { logoutUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

interface NavbarProps {
  title: string;
  role?: string;
  userName?: string;
  orgName?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export function Navbar({ 
  title = "Executive Dashboard", 
  role = "Executive", 
  userName,
  orgName,
  primaryActionLabel,
  onPrimaryAction
}: NavbarProps) {
  const router = useRouter();
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const orgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const rolePath = role.toLowerCase();

  const fetchNotifications = async () => {
    setNotificationsLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      const response = await apiFetch<{
        enabled: boolean;
        items: Array<{
          id: number;
          type: string;
          title: string;
          message: string;
          isRead: boolean;
          createdAt: string;
        }>;
        unreadCount: number;
      }>("/settings/notifications", { token });

      setNotificationsEnabled(response.enabled !== false);
      setNotifications(Array.isArray(response.items) ? response.items : []);
      setUnreadCount(Number(response.unreadCount || 0));
    } catch {
      setNotifications([]);
      setNotificationsEnabled(true);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      await apiFetch("/settings/notifications/read", {
        method: "PUT",
        body: JSON.stringify({ markAll: true }),
        token,
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // keep UI stable even when read-mark request fails
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, []);

  const displayOrgName = orgName || "Your Organisation";
  const displayUserName = userName || "Your Profile";
  const userInitial = displayUserName.charAt(0).toUpperCase();
  const hasPrimaryAction = Boolean(primaryActionLabel && onPrimaryAction);
  const formatRelativeTime = (value: string) => {
    const then = new Date(value).getTime();
    const now = Date.now();
    const diffInMinutes = Math.max(1, Math.floor((now - then) / (1000 * 60)));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <nav className="h-16 bg-transparent absolute top-0 right-0 left-0 z-40">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium text-gray-400">{title}</h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              className="relative p-2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
              onClick={() => {
                const nextOpen = !isNotificationsOpen;
                setIsNotificationsOpen(nextOpen);
                if (nextOpen) {
                  fetchNotifications();
                  if (unreadCount > 0) {
                    markAllNotificationsAsRead();
                  }
                }
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 min-w-[0.5rem] h-2 px-1 bg-red-500 rounded-full border-2 border-white text-[9px] leading-none text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in-up z-50">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1F3A4A]">Notifications</p>
                    <p className="text-[11px] text-gray-400">
                      {notificationsEnabled ? "Recent activity across your account" : "In-app notifications are disabled"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchNotifications}
                    className="text-[11px] font-bold text-primary hover:text-secondary transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                {notificationsEnabled && unreadCount > 0 && (
                  <div className="px-4 py-2 border-b border-gray-50">
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-bold text-secondary hover:text-primary transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}

                <div className="max-h-[420px] overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">Loading notifications...</div>
                  ) : !notificationsEnabled ? (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">
                      Turn on in-app notifications from your preferences to see alerts here.
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">No new notifications right now.</div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 border-b border-gray-50 last:border-b-0 ${
                          item.isRead ? "bg-white" : "bg-secondary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#1F3A4A]">{item.title}</p>
                            <p className="text-xs text-gray-500 leading-relaxed mt-1">{item.message}</p>
                          </div>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-300">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Organization Selector Dropdown */}
          <div className="relative" ref={orgRef}>
            <div
              className={`flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-1.5 transition-all ${
                hasPrimaryAction ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
              onClick={() => {
                if (hasPrimaryAction) {
                  setIsOrgOpen(!isOrgOpen);
                }
              }}
            >
              <span className="text-sm font-medium text-primary">{displayOrgName}</span>
              {hasPrimaryAction && (
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOrgOpen ? 'rotate-180' : ''}`} />
              )}
            </div>

            {hasPrimaryAction && isOrgOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-up z-50">
                <div className="px-4 py-2 bg-[#1F3A4A]/5 border-l-4 border-[#1F3A4A]">
                  <span className="text-sm font-bold text-[#1F3A4A]">{displayOrgName}</span>
                </div>
                <div className="border-t border-gray-50 my-1"></div>
                <div 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2 text-secondary"
                  onClick={() => {
                    setIsOrgOpen(false);
                    onPrimaryAction?.();
                  }}
                >
                  <Plus size={14} />
                  <span className="text-sm font-bold">+ {primaryActionLabel}</span>
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
                <Link href={`/dashboard/${rolePath}/settings`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                  <User size={16} />
                  Profile & Settings
                </Link>
                <Link href={`/dashboard/${rolePath}/help`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                  <Settings size={16} />
                  Help & Support
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
