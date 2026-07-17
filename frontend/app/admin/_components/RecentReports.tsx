"use client";

import Image from "next/image";
import Link from "next/link";
import { HiEye, HiArrowRight } from "react-icons/hi";

interface Report {
  _id: string;
  itemCategory: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reportedBy?: {
    fullName: string;
  };
  imageUrl?: string;
}

interface RecentReportsProps {
  reports: Report[];
}

export default function RecentReports({ reports }: RecentReportsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-[#1B2A4F]/5 text-[#E85D4A]";
      default: return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusText = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
          <p className="text-sm text-gray-500 mt-1">Latest lost &amp; found reports submitted</p>
        </div>
        <Link
          href="/admin/reports"
          className="text-[#E85D4A] hover:text-[#D94A37] font-medium flex items-center gap-2 transition"
        >
          View All
          <HiArrowRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-gray-200">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No reports yet</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="p-4 hover:bg-gray-50 transition flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                {report.imageUrl ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                    alt={report.itemCategory}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <HiEye className="text-gray-500" size={20} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 capitalize truncate">
                  {report.itemCategory}
                </p>
               
                <p className="text-sm text-gray-500 truncate">
                  {report.location}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  by {report.reportedBy?.fullName || "Unknown"}
                </p>
              </div>

              {/* Status & Time */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(report.status)}`}>
                  {getStatusText(report.status)}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(report.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}