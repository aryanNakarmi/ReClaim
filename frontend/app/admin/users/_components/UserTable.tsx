"use client";

import Image from "next/image";
import Link from "next/link";
import { HiEye } from "react-icons/hi";

export interface User {
  _id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string | null;
  role: string;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onDelete: (userId: string, userName: string) => void;
}

export default function UserTable({ users, onDelete }: UserTableProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!users || users.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 border border-gray-200 rounded-xl bg-[#F0EDE6]">
        No users found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full w-full">
        <thead className="bg-[#F0EDE6]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#E85D4A] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-100">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-[#F0EDE6] transition">
              <td className="px-4 py-3">
                {user.profilePicture ? (
                  <div className="relative w-10 h-10">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profilePicture}`}
                      alt={user.fullName || ""}
                      fill
                      sizes="40px"
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-[#1B2A4F]/5 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {user.fullName || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {user.phoneNumber || "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm flex gap-3">
                <Link
                  href={`/admin/users/${user._id}`}
                  className="text-blue-600 hover:text-[#233459] font-medium transition inline-flex items-center gap-1"
                >
                  <HiEye size={16} />
                  View
                </Link>
                <button
                  onClick={() => onDelete(user._id, user.fullName || user.email)}
                  className="text-[#E85D4A] hover:text-[#E85D4A] font-medium transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}