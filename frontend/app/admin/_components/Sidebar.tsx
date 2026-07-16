"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import {
  HiUsers,
  HiCog,
  HiLogout,
  HiClipboardList,
  HiPencil,
  HiChat,
  HiX,
} from "react-icons/hi";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (pathname === "/admin/chat") {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await axios.get("/api/v1/chats");
        if (res.data.success) {
          const chats = res.data.data || [];
          const total = chats.reduce(
            (sum: number, c: any) => sum + (c.unreadCount || 0),
            0
          );
          setUnreadCount(total);
        }
      } catch {
        // silently fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <HiCog size={22} /> },
    { href: "/admin/users", label: "Users", icon: <HiUsers size={22} /> },
    { href: "/admin/reports", label: "Reports", icon: <HiClipboardList size={22} /> },
    { href: "/admin/found-items", label: "Found Items", icon: <HiPencil size={22} /> },
    { href: "/admin/chat", label: "Chat", icon: <HiChat size={22} />, badge: unreadCount },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-full flex flex-col p-6 justify-between">
      <div className="flex flex-col gap-8">

        {/* Profile + close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.profilePicture ? (
              <Image
                src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
                alt={user.fullName || "Admin"}
                width={52}
                height={52}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#E85D4A]"
              />
            ) : (
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center border-2 border-[#E85D4A]">
                <span className="text-gray-600 font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-gray-900 text-base font-bold">Welcome back</h1>
              <p className="text-[#E85D4A] text-sm font-medium truncate max-w-[120px]">
                {user?.fullName || "Admin"}
              </p>
            </div>
          </div>

          {/* Close button — mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition flex-shrink-0"
              aria-label="Close menu"
            >
              <HiX size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#1B2A4F] text-white"
                    : "bg-white text-black hover:bg-[#F0EDE6]"
                }`}
              >
                <span className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E85D4A] rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </span>
                <p className="text-sm">{item.label}</p>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 rounded-lg h-14 bg-[#1B2A4F] text-white font-bold w-full hover:bg-[#233459] transition-colors"
      >
        <HiLogout size={20} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}