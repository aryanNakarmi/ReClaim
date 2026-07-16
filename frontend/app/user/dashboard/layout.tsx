// app/user/dashboard/layout.tsx
"use client";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen p-4 md:p-8 gap-6">
      {children}
    </div>
  );
}
