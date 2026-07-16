import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

export interface LostItemReport {
  _id: string;
  itemCategory: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  description?: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  reportedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getToken = () => {
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
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
};

export const getMyReports = async (page: number = 1, limit: number = 10) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first", data: [] };

    const response = await axios.get(`${API_URL}/lost-reports/my-reports`, {
      params: { page, limit },
      headers: createAuthHeader(),
    });

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      pages: response.data.pages || 1,
    };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch reports", data: [] };
  }
};

export const getReportById = async (reportId: string) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first", data: null };

    const response = await axios.get(`${API_URL}/lost-reports/${reportId}`, {
      headers: createAuthHeader(),
    });

    return { success: response.data.success, message: response.data.message, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch report", data: null };
  }
};

export const createReport = async (reportData: {
  itemCategory: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  description?: string;
  imageUrl: string;
}) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first", data: null };

    const response = await axios.post(`${API_URL}/lost-reports`, reportData, {
      headers: createAuthHeader(),
    });

    return { success: response.data.success, message: response.data.message, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to create report", data: null };
  }
};

export const uploadReportPhoto = async (file: File) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first", data: null };

    const formData = new FormData();
    formData.append("lostItem", file);

    const response = await axios.post(`${API_URL}/lost-reports/upload-photo`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { success: response.data.success, message: response.data.message, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to upload photo", data: null };
  }
};

export const deleteReport = async (reportId: string) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first" };

    const response = await axios.delete(`${API_URL}/lost-reports/${reportId}`, {
      headers: createAuthHeader(),
    });

    return { success: response.data.success, message: response.data.message };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to delete report" };
  }
};

export const getApprovedReports = async (page: number = 1, limit: number = 12) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first", data: [] };

    const response = await axios.get(`${API_URL}/lost-reports/all`, {
      params: { page, limit },
      headers: createAuthHeader(),
    });

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      pages: response.data.pages || 1,
    };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch reports", data: [] };
  }
};

export const getReportsByCategory = async (category: string) => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "Please log in first", data: [] };

    const response = await axios.get(`${API_URL}/lost-reports/category/${category}`, {
      headers: createAuthHeader(),
    });

    return { success: response.data.success, message: response.data.message, data: response.data.data || [] };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch reports", data: [] };
  }
};
