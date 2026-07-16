"use client";

import { ReactNode } from "react";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen p-4 md:p-8 gap-6">
      {children}
    </div>
  );
}
