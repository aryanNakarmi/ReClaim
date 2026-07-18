"use client";

import { ReactNode } from "react";
import { HiArrowTrendingUp } from "react-icons/hi2";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "orange" | "green" | "red" | "purple" | "indigo";
  trend?: number; 
  trendLabel?: string;
  subtext?: string;
}
     
export default function StatCard({
  title,
  value,  
  icon,
  color,
  trend,
  trendLabel,
  subtext,
}: StatCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-[#F0EDE6] text-[#E85D4A] border-gray-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  };

  const bgColor = {
    blue: "bg-blue-100",
    orange: "bg-orange-100",
    green: "bg-green-100",
    red: "bg-[#1B2A4F]/5",
    purple: "bg-purple-100",
    indigo: "bg-indigo-100",
  };

  return (
    <div className={`p-6 rounded-lg border ${colorStyles[color]} bg-white shadow`}>
      {/* Icon */}
      <div className={`w-12 h-12 ${bgColor[color]} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        {title}
      </p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>

      {/* Trend */}
      {trend !== undefined && trendLabel && (
        <div className="flex items-center gap-2 mt-3 text-sm">
          <HiArrowTrendingUp className="text-green-600" size={16} />
          <span className="text-green-600 font-medium">
            +{trend} {trendLabel}
          </span>
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <p className="text-xs text-gray-500 mt-3">{subtext}</p>
      )}
    </div>
  );
}