"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/api/axios";
import { toast } from "react-toastify";
import { HiShieldExclamation, HiTrash, HiPlus } from "react-icons/hi";

interface BlockedIP {
  _id: string;
  ip: string;
  reason: string;
  blockedBy?: { fullName: string; email: string };
  blockedAt: string;
}

function timeAgo(dateString: string) {
  const now = Date.now();
  const diff = now - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function IPBlockPage() {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [newReason, setNewReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBlockedIPs = async () => {
    try {
      const res = await axios.get("/api/v1/admin/ip-block");
      if (res.data.success) {
        setBlockedIPs(res.data.data);
      }
    } catch {
      toast.error("Failed to load blocked IPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIP.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post("/api/v1/admin/ip-block", {
        ip: newIP.trim(),
        reason: newReason.trim() || "Blocked by admin",
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setNewIP("");
        setNewReason("");
        setShowForm(false);
        fetchBlockedIPs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to block IP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      const res = await axios.delete(`/api/v1/admin/ip-block/${encodeURIComponent(ip)}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchBlockedIPs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unblock IP");
    }
  };

  const filteredIPs = blockedIPs.filter(
    (b) =>
      b.ip.includes(searchTerm) ||
      b.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IP Blocking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage blocked IP addresses to prevent unwanted access
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] transition font-semibold text-sm"
        >
          <HiPlus size={18} />
          {showForm ? "Cancel" : "Block IP"}
        </button>
      </div>

      {/* Block Form */}
      {showForm && (
        <form
          onSubmit={handleBlock}
          className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="e.g. 192.168.1.1 or ::1"
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-900 focus:border-[#E85D4A] focus:outline-none transition text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Why is this IP being blocked?"
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-900 focus:border-[#E85D4A] focus:outline-none transition text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newIP.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50"
          >
            {submitting ? "Blocking..." : "Block IP"}
          </button>
        </form>
      )}

      {/* Search */}
      {blockedIPs.length > 0 && (
        <input
          type="text"
          placeholder="Search by IP or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-900 focus:border-[#E85D4A] focus:outline-none transition text-sm"
        />
      )}

      {/* IP List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B2A4F]" />
          </div>
        ) : filteredIPs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiShieldExclamation size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold">No blocked IPs</p>
            <p className="text-sm mt-1">
              {searchTerm
                ? "No IPs match your search"
                : "Click 'Block IP' to start blocking addresses"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredIPs.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <HiShieldExclamation size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-gray-900">{item.ip}</p>
                    <p className="text-sm text-gray-500">{item.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Blocked {timeAgo(item.blockedAt)} by{" "}
                      {item.blockedBy?.fullName || "Admin"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(item.ip)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Unblock IP"
                >
                  <HiTrash size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {blockedIPs.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {blockedIPs.length} IP{blockedIPs.length !== 1 ? "s" : ""} blocked
        </p>
      )}
    </div>
  );
}
