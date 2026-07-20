"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import {
  HiChartBar, 
  HiHeart,
  HiPencil,
  HiChat,
  HiUser,
  HiCog,
  HiLogout,
  HiX,
  HiShieldCheck,
} from "react-icons/hi";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (pathname === "/user/chat") {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const res = await axios.get("/api/v1/chats/my-chat");
        if (res.data.success && !cancelled) {
          const messages = res.data.data.messages || [];
          const count = messages.filter(
            (m: any) => m.senderRole === "admin" && !m.isRead
          ).length;
          setUnreadCount(count);
        }
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  const navItems = [
    {
      href: "/user/dashboard",
      label: "Dashboard",
      icon: <HiChartBar size={22} />,
    },
    { href: "/user/items", label: "Items", icon: <HiHeart size={22} /> },
    { href: "/user/report-lost", label: "Report Lost", icon: <HiPencil size={22} /> },
    {
      href: "/user/chat",
      label: "Chat",
      icon: <HiChat size={22} />,
      badge: unreadCount,
    },
    { href: "/user/profile", label: "Profile", icon: <HiUser size={22} /> },
    {
      href: "/user/profile/security",
      label: "Security",
      icon: <HiShieldCheck size={22} />,
    },
    ...(user?.role === "admin"
      ? [
          {
            href: "/admin/users",
            label: "Admin Panel",
            icon: <HiCog size={22} />,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 h-full flex flex-col p-6 justify-between">
      {/* Profile Section */}
      <div className="flex flex-col gap-8">
        {/* Top row: profile + close button (mobile only) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.profilePicture ? (
              <Image
                src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
                alt={user.fullName}
                width={52}
                height={52}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#E85D4A]"
              />
            ) : (
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center border-2 border-[#E85D4A]">
                <span className="text-gray-600 font-bold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-gray-900 text-base font-bold">Welcome back</h1>
              <p className="text-[#E85D4A] text-sm font-medium truncate max-w-[120px]">
                {user?.fullName || user?.email}
              </p>
            </div>
          </div>

          {/* Close button — only visible on mobile */}
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

        {/* Navigation Items */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose} // close sidebar on mobile after navigating
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

      {/* Logout Button */}
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