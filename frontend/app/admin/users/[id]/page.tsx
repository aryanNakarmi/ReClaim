import { getUserById } from "@/lib/api/admin/user";
import Image from "next/image";
import Link from "next/link";
import { HiPencil, HiArrowLeft } from "react-icons/hi";

export default async function UserDetailPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    
    // Fetch user data
    const response = await getUserById(id);
    
    if (!response.success || !response.data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
                    <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg 
                        hover:bg-black transition
                        "
                    >
                        <HiArrowLeft size={18} />
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    const user = response.data;

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-[#E85D4A] hover:text-[#E85D4A] font-semibold transition"
            >
                <HiArrowLeft size={20} />
                Back to Users
            </Link>

            {/* User Card */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* Header with buttons */}
                <div className="bg-gradient-to-r from-[#1B2A4F] to-[#233459] px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">User Details</h1>
                    <Link
                        href={`/admin/users/${id}/edit`}
                        className="inline-flex items-center gap-2 bg-white text-[#E85D4A] px-4 py-2 rounded-lg hover:bg-[#F0EDE6] transition font-semibold"
                    >
                        <HiPencil size={18} />
                        Edit User
                    </Link>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Profile Section */}
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            {user.profilePicture ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profilePicture}`}
                                    alt={user.fullName || "User"}
                                    width={150}
                                    height={150}
                                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                                />
                            ) : (
                                <div className="w-40 h-40 bg-[#1B2A4F]/5 rounded-full flex items-center justify-center border-4 border-gray-200 shadow-lg">
                                    <span className="text-[#E85D4A] font-bold text-5xl">
                                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                                <p className="text-2xl font-bold text-gray-900">{user.fullName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email</p>
                                <p className="text-lg text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Role</p>
                                <span
                                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                        user.role === "admin"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200" />

                    {/* Detailed Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-gray-900">{user.phoneNumber || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Member Since</p>
                                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">User ID</p>
                                    <p className="text-gray-900 font-mono text-sm">{user._id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-200" />

                   
                </div>
            </div>
        </div>
    );
}