"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { HiCheck, HiX, HiEye, HiChevronRight, HiArrowLeft } from "react-icons/hi";
import { HiMapPin } from "react-icons/hi2";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

interface LostItemReport {
  _id: string;
  itemCategory: string;
  location: { address: string; lat: number; lng: number };
  description?: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  reportedBy?: { _id: string; fullName: string; email: string };
  createdAt: string;
}

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith("auth_token="))
      return decodeURIComponent(cookie.substring("auth_token=".length));
  }
  return null;
};

const createAuthHeader = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function AdminReportsPage() {
  const [allReports, setAllReports] = useState<LostItemReport[]>([]);
  const [reports, setReports] = useState<LostItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedReport, setSelectedReport] = useState<LostItemReport | null>(null);

  // Mobile: "list" | "detail"
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const itemsPerPage = 10;

  useEffect(() => { fetchReports(currentPage); }, [currentPage, selectedFilter]);

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/lost-reports/all`, {
        params: { page, limit: itemsPerPage },
        headers: createAuthHeader(),
      });
      if (response.data.success) {
        const all = response.data.data || [];
        setAllReports(all);
        setReports(selectedFilter !== "all" ? all.filter((r: LostItemReport) => r.status === selectedFilter) : all);
        setTotalPages(response.data.pages || 1);
        setTotalReports(response.data.total || 0);
      } else {
        toast.error("Failed to load reports");
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const countFor = (status: string) => allReports.filter((r) => r.status === status).length;

  const handleApproveReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      const response = await axios.put(`${API_URL}/lost-reports/${reportId}/status`, { status: "approved" }, { headers: createAuthHeader() });
      if (response.data.success) {
        toast.success("Report approved");
        setSelectedReport(null);
        setMobileView("list");
        fetchReports(currentPage);
      } else toast.error("Failed to approve report");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      const response = await axios.put(`${API_URL}/lost-reports/${reportId}/status`, { status: "rejected" }, { headers: createAuthHeader() });
      if (response.data.success) {
        toast.success("Report rejected");
        setSelectedReport(null);
        setMobileView("list");
        fetchReports(currentPage);
      } else toast.error("Failed to reject report");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectReport = (report: LostItemReport) => {
    setSelectedReport(report);
    setMobileView("detail");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-[#1B2A4F]/5 text-[#E85D4A]";
      default: return "bg-[#F0EDE6] text-[#1B2A4F]";
    }
  };

  const getStatusText = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const firstItemNumber = (currentPage - 1) * itemsPerPage + 1;
  const lastItemNumber = Math.min(firstItemNumber + itemsPerPage - 1, totalReports);

  const FILTERS = [
    { key: "pending",  label: "Pending",  badge: "bg-[#F0EDE6] text-orange-700", activeBorder: "border-[#E85D4A] text-[#E85D4A]" },
    { key: "approved", label: "Approved", badge: "bg-green-100 text-green-700",   activeBorder: "border-green-600 text-green-600"  },
    { key: "rejected", label: "Rejected", badge: "bg-[#1B2A4F]/5 text-[#E85D4A]",       activeBorder: "border-[#E85D4A] text-[#E85D4A]"      },
  ] as const;

  // ── List Panel ──
  const ListPanel = (
    <div className="w-full lg:col-span-2 flex flex-col bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Lost Item Reports</h2>
      </div>

      <div className="flex gap-0 px-4 pt-3 border-b border-gray-200">
        {FILTERS.map(({ key, label, badge, activeBorder }) => {
          const isActive = selectedFilter === key;
          const count = countFor(key);
          return (
            <button
              key={key}
              onClick={() => { setSelectedFilter(key); setCurrentPage(1); setSelectedReport(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition border-b-2 ${
                isActive ? `${activeBorder} border-b-2` : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
              <span className={`text-xs font-bold ${isActive ? badge.split(" ")[1] : "text-gray-400"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E85D4A]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No {selectedFilter} reports</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <button
                key={report._id}
                onClick={() => handleSelectReport(report)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition flex items-center gap-3 ${
                  selectedReport?._id === report._id ? "bg-[#F0EDE6]" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                  {report.imageUrl ? (
                    <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`} alt={report.itemCategory} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <HiEye className="text-gray-500" size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 capitalize truncate">{report.itemCategory}</h3>
                  <p className="text-sm text-gray-500 truncate">{report.location.address}</p>
                  <p className="text-xs text-gray-400 mt-1">{report.reportedBy?.fullName}</p>
                </div>
                <HiChevronRight className="text-gray-400 flex-shrink-0" size={20} />
              </button>
            ))}
          </div>
        )}
      </div>

      {totalReports > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 transition">
            Previous
          </button>
          <span className="text-sm text-gray-500">
            <strong>{firstItemNumber}–{lastItemNumber}</strong> of <strong>{totalReports}</strong>
          </span>
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 transition">
            Next
          </button>
        </div>
      )}
    </div>
  );

  // ── Detail Panel ──
  const DetailPanel = (
    <div className="w-full lg:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      {selectedReport ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Back button — mobile only */}
            <button
              onClick={() => setMobileView("list")}
              className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-2"
            >
              <HiArrowLeft size={18} /> Back to list
            </button>

            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-200 relative">
              {selectedReport.imageUrl ? (
                <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${selectedReport.imageUrl}`} alt={selectedReport.itemCategory} fill sizes="300px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <HiEye className="text-gray-500" size={40} />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize mb-1">{selectedReport.itemCategory}</h2>
              <div className="flex items-start gap-1.5 text-gray-600">
                <HiMapPin size={18} className="text-[#E85D4A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">{selectedReport.location.address}</p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selectedReport.location.lat}&mlon=${selectedReport.location.lng}#map=18/${selectedReport.location.lat}/${selectedReport.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#E85D4A] font-semibold hover:underline"
                  >
                    Open on map ↗
                  </a>
                </div>
              </div>
            </div>

            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReport.status)}`}>
              {getStatusText(selectedReport.status)}
            </span>

            {selectedReport.description && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Description</p>
                <p className="text-sm text-gray-600">{selectedReport.description}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Reported by</p>
              <p className="font-semibold text-gray-900">{selectedReport.reportedBy?.fullName}</p>
              <p className="text-xs text-gray-500">{selectedReport.reportedBy?.email}</p>
            </div>

            <div className="text-xs text-gray-500">{formatDate(selectedReport.createdAt)}</div>
          </div>

          {selectedReport.status === "pending" && (
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => handleApproveReport(selectedReport._id)}
                disabled={actionLoading === selectedReport._id}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <HiCheck size={18} /> Approve
              </button>
              <button
                onClick={() => handleRejectReport(selectedReport._id)}
                disabled={actionLoading === selectedReport._id}
                className="w-full bg-[#1B2A4F] text-white px-4 py-2 rounded-lg hover:bg-[#233459] transition font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <HiX size={18} /> Reject
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-sm">Select a report to view details</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: side-by-side grid */}
      <div className="hidden lg:grid grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {ListPanel}
        {DetailPanel}
      </div>

      {/* Mobile: show list OR detail */}
      <div className="lg:hidden h-[calc(100vh-120px)]">
        {mobileView === "list" ? ListPanel : DetailPanel}
      </div>
    </>
  );
}