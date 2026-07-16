"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import UserTable from "./_components/UserTable";
import { toast } from "react-toastify";
import { deleteUserById, fetchUsers } from "@/lib/api/admin/user";


const PAGE_SIZE = 8;

interface User {
  _id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string | null;
  role: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch users with pagination
  const fetchUsersList = useCallback(
    async (page: number = 1, search: string = "") => {
      try {
        setLoading(true);
        const response = await fetchUsers(page, PAGE_SIZE, search);
        
        if (response.success) {
          setUsers(response.data || []);
          setPagination(response.pagination || null);
          setCurrentPage(page);
        } else {
          toast.error(response.message || "Failed to fetch users");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchUsersList(1, "");
  }, [fetchUsersList]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      fetchUsersList(1, value); // Reset to page 1 when searching
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeout);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchUsersList(currentPage - 1, searchQuery);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      fetchUsersList(currentPage + 1, searchQuery);
    }
  };

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      fetchUsersList(page, searchQuery);
    }
  };

  // Handle delete
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const response = await deleteUserById(userId);
      
      if (response.success) {
        toast.success(`${userName} deleted successfully`);
        fetchUsersList(currentPage, searchQuery); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link 
          className="bg-[#1B2A4F] text-white px-4 py-2 rounded-lg hover:bg-[#233459] transition font-semibold"
          href="/admin/users/create"
        >
          + Create User
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, email, or phone number..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85D4A]"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && users.length > 0 && (
        <>
          <UserTable 
            users={users} 
            onDelete={handleDeleteUser}
          />

          {/* Pagination Controls */}
          {pagination && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-xl border border-gray-200">
              {/* Left - Info */}
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-500">{users.length}</span> of{" "}
                <span className="font-semibold text-gray-500">{pagination.total}</span> users
              </div>

              {/* Center - Page Numbers */}
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-500"
                >
                  ← Previous
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        currentPage === pageNum
                          ? "bg-[#1B2A4F] text-white"
                          : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-500"
                >
                  Next →
                </button>
              </div>

              {/* Right - Total Pages */}
              <div className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-500">{currentPage}</span> of{" "}
                <span className="font-semibold text-gray-500">{pagination.totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-xl bg-[#F0EDE6]">
          <p className="text-gray-500 text-lg">No users found</p>
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="text-[#E85D4A] hover:text-[#D94A37] mt-2 underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}