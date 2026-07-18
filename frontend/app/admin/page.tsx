"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify"; 
import axios from "axios";
import {
  HiClipboardList,
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiClock,
} from "react-icons/hi";
import StatCard from "./_components/StatCard";
import RecentReports from "./_components/RecentReports";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
}

interface RecentReport {
  _id: string;
  itemCategory: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reportedBy?: {
    fullName: string;
  };
  imageUrl?: string;
}

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith("auth_token=")) {
      return decodeURIComponent(cookie.substring("auth_token=".length));
    }
  }
  return null;
};

const createAuthHeader = () => {
  const token = getAuthToken();
  return { Authorization: `Bearer ${token}` };
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const reportsResponse = await axios.get(`${API_URL}/lost-reports/all`, {
        headers: createAuthHeader(),
      });

      const usersResponse = await axios.get(`${API_URL}/admin/users`, {
        headers: createAuthHeader(),
      });

      if (reportsResponse.data.success && usersResponse.data.success) {
        const reports = reportsResponse.data.data || [];
        const users = usersResponse.data.data || [];

        setStats({
          totalReports: reports.length,
          pendingReports: reports.filter((r: any) => r.status === "pending").length,
          approvedReports: reports.filter((r: any) => r.status === "approved").length,
          rejectedReports: reports.filter((r: any) => r.status === "rejected").length,
          totalUsers: users.length,
        });

        const sortedReports = [...reports].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setRecentReports(sortedReports.slice(0, 5));
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of reports and users on ReClaim.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Reports" value={stats?.totalReports || 0} icon={<HiClipboardList size={24} />} color="blue" />
        <StatCard title="Pending"       value={stats?.pendingReports || 0}  icon={<HiClock size={24} />}        color="orange" />
        <StatCard title="Approved"      value={stats?.approvedReports || 0} icon={<HiCheckCircle size={24} />}  color="green" />
        <StatCard title="Rejected"      value={stats?.rejectedReports || 0} icon={<HiXCircle size={24} />}      color="red" />
        <StatCard title="Total Users"   value={stats?.totalUsers || 0}      icon={<HiUsers size={24} />}        color="purple" />
      </div>

      <RecentReports reports={recentReports} />
    </div>
  );
}