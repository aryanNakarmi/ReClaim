"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./_components/Sidebar";
import { ToastContainer } from "react-toastify";
import { HiMenu } from "react-icons/hi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { 
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user && user.role !== "admin") {
      router.push("/user/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-72 min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Open menu"
          >
            <HiMenu size={24} />
          </button>
          <span className="font-bold text-gray-900 text-lg">ReClaim Admin</span>
        </div>

        <div className="p-4 md:p-8">
          <ToastContainer position="top-right" autoClose={3000} />
          {children}
        </div>
      </main>
    </div>
  );
}