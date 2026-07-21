"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  HiShieldExclamation,
  HiShieldCheck,
  HiInformationCircle,
  HiFilter,
} from "react-icons/hi";

interface ActivityEvent {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  success: boolean;
  severity: "info" | "warning" | "critical";
  userRole?: string;
  userName?: string;
  userEmail?: string;
  ip: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Login",
  REGISTER: "Registration",
  LOGOUT: "Logout",
  PASSWORD_RESET_REQUEST: "Password Reset Requested",
  PASSWORD_RESET: "Password Reset",
  MFA_SETUP: "MFA Setup",
  MFA_VERIFY: "MFA Verify",
  MFA_DISABLE: "MFA Disabled",
  CREATE_REPORT: "Lost Report Created",
  APPROVE_REPORT: "Report Approved",
  REJECT_REPORT: "Report Rejected",
  CLAIM_REQUEST: "Claim Requested",
  CLAIM_APPROVED: "Claim Approved",
};

function getStatusColor(success: boolean, severity: string) {
  if (!success) {
    if (severity === "critical") return "bg-red-100 border-red-400 text-red-800";
    return "bg-orange-100 border-orange-400 text-orange-800";
  }
  return "bg-green-100 border-green-400 text-green-800";
}

function getActionIcon(action: string, success: boolean) {
  if (!success) return <HiShieldExclamation size={18} className="text-red-600 shrink-0" />;
  if (["LOGIN", "REGISTER"].includes(action)) return <HiShieldCheck size={18} className="text-green-600 shrink-0" />;
  return <HiInformationCircle size={18} className="text-blue-600 shrink-0" />;
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AdminMonitorPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failure">("all");
  const [paused, setPaused] = useState(false);
  const [eventCount, setEventCount] = useState({ total: 0, failures: 0, critical: 0 });
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // ── Fetch recent activities on mount ──
  const fetchRecent = useCallback(async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("auth_token="))
        ?.split("=")[1];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/activities?limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket.io connection for live events ──
  useEffect(() => {
    fetchRecent();

    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => console.log("Monitor: socket connected"));
    socket.on("activity:new", (event: ActivityEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 500));
      setEventCount((prev) => ({
        total: prev.total + 1,
        failures: prev.failures + (event.success ? 0 : 1),
        critical: prev.critical + (event.severity === "critical" ? 1 : 0),
      }));
    });
    socket.on("disconnect", () => console.log("Monitor: socket disconnected"));

    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, [fetchRecent]);

  // ── Auto-scroll ──
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const filteredEvents = filter === "all"
    ? events
    : filter === "success"
    ? events.filter((e) => e.success)
    : events.filter((e) => !e.success);

  const failureCount = events.filter((e) => !e.success).length;
  const criticalCount = events.filter((e) => e.severity === "critical").length;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitor</h1>
          <p className="text-sm text-gray-500">Real-time security event feed</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-semibold">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              {eventCount.total || events.length} events
            </span>
            {failureCount > 0 && (
              <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full font-semibold">
                {failureCount} failed
              </span>
            )}
            {criticalCount > 0 && (
              <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full font-semibold animate-pulse">
                ⚠ {criticalCount} critical
              </span>
            )}
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setPaused(!paused)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
              paused
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <HiFilter size={16} className="text-gray-400" />
        {(["all", "failure", "success"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === f
                ? "bg-[#1B2A4F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "failure" ? "Failures Only" : "Success Only"}
          </button>
        ))}
      </div>

      {/* Event Feed */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-2"
        onScroll={() => {
          if (listRef.current) {
            setAutoScroll(listRef.current.scrollTop === 0);
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B2A4F]" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">No events yet</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition ${
                getStatusColor(event.success, event.severity)
              } ${
                !event.success && event.severity === "critical"
                  ? "animate-pulse shadow-sm"
                  : ""
              }`}
            >
              {getActionIcon(event.action, event.success)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">
                    {ACTION_LABELS[event.action] || event.action}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      event.success
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {event.success ? "SUCCESS" : "FAILED"}
                  </span>
                </div>
                {(event.userName || event.details) && (
                  <p className="text-xs mt-0.5 opacity-80">
                    {event.userName && <span className="font-semibold">{event.userName}</span>}
                    {event.userEmail && <span className="text-gray-500 ml-1">({event.userEmail})</span>}
                    {event.details && <span className="ml-1">— {event.details}</span>}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[10px] opacity-60 font-mono">
                  <span>{formatTimestamp(event.createdAt)}</span>
                  <span>IP: {event.ip}</span>
                  {event.userRole && <span>Role: {event.userRole}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live indicator */}
      {!paused && !loading && (
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live — listening for events</span>
          <span className="ml-auto">{events.length} events in session</span>
        </div>
      )}
    </div>
  );
}
