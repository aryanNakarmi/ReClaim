"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiArrowLeft, HiTrash, HiPencil, HiCheckCircle, HiMail, HiUser, HiClock } from "react-icons/hi";
import {
  handleGetFoundItemById,
  handleDeleteFoundItem,
  handleUpdateFoundItemStatus,
} from "@/lib/actions/found-item-action";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:5050";

interface ClaimRequest {
  userId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  proofDescription: string;
  requestedAt: string;
}

interface FoundItem {
  _id: string;
  itemCategory: string;
  condition: string;
  brandColor: string;
  estimatedValue: number;
  location: string;
  description: string;
  photos: string[];
  status: "Unclaimed" | "Claimed";
  claimedBy?: { _id: string; fullName: string; email: string };
  claimRequests?: ClaimRequest[];
  createdAt: string;
  updatedAt: string;
}

export default function FoundItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "requests">("details");

  useEffect(() => { fetchItem(); }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await handleGetFoundItemById(id);
      if (response.success) {
        setItem(response.data);
        if (response.data.claimedBy) setSelectedUser(response.data.claimedBy._id);
      } else toast.error(response.message || "Failed to load item");
    } catch (error: any) {
      toast.error(error.message || "Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await handleDeleteFoundItem(id);
      if (response.success) {
        toast.success("Item deleted successfully");
        router.push("/admin/found-items");
      } else toast.error(response.message || "Failed to delete item");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return toast.error("Please select a user");
    try {
      setUpdatingStatus(true);
      const response = await handleUpdateFoundItemStatus(id, "Claimed", selectedUser);
      if (response.success) {
        setItem(response.data);
        setShowUpdateModal(false);
        toast.success("Item marked as claimed");
      } else toast.error(response.message || "Failed to update status");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkUnclaimed = async () => {
    try {
      setUpdatingStatus(true);
      const response = await handleUpdateFoundItemStatus(id, "Unclaimed");
      if (response.success) {
        setItem(response.data);
        toast.success("Item marked as unclaimed");
      } else toast.error(response.message || "Failed to update status");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const nextPhoto = () => { if (item?.photos) setCurrentPhotoIndex((p) => (p + 1) % item.photos.length); };
  const prevPhoto = () => { if (item?.photos) setCurrentPhotoIndex((p) => (p - 1 + item.photos.length) % item.photos.length); };

  const claimRequests = item?.claimRequests ?? [];

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E85D4A]" />
      </div>
    );

  if (!item)
    return (
      <div className="text-center py-12 text-gray-600">
        Item not found. <Link href="/admin/found-items" className="text-[#E85D4A] hover:underline">Back</Link>
      </div>
    );

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/found-items" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <HiArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{item.brandColor}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            {item.photos.length > 0 ? (
              <Image src={`${BASE_URL}${item.photos[currentPhotoIndex]}`} alt={item.brandColor} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
            {item.photos.length > 1 && (
              <>
                <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition">❮</button>
                <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition">❯</button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                  {currentPhotoIndex + 1} / {item.photos.length}
                </div>
              </>
            )}
          </div>

          {item.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {item.photos.map((photo, i) => (
                <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${currentPhotoIndex === i ? "border-[#E85D4A]" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <Image src={`${BASE_URL}${photo}`} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 px-6 py-3 text-sm font-semibold transition ${activeTab === "details" ? "border-b-2 border-[#E85D4A] text-[#E85D4A]" : "text-gray-500 hover:text-gray-700"}`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 px-6 py-3 text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === "requests" ? "border-b-2 border-[#E85D4A] text-[#E85D4A]" : "text-gray-500 hover:text-gray-700"}`}
              >
                Claim Requests
                {claimRequests.length > 0 && (
                  <span className="bg-[#1B2A4F] text-white text-xs font-bold px-2 py-0.5 rounded-full">{claimRequests.length}</span>
                )}
              </button>
            </div>

            {activeTab === "details" && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><p className="text-sm text-gray-500">Category</p><p className="font-semibold text-gray-800">{item.itemCategory}</p></div>
                  <div><p className="text-sm text-gray-500">Condition</p><p className="font-semibold text-gray-800">{item.condition}</p></div>
                  <div><p className="text-sm text-gray-500">Est. Value</p><p className="font-semibold text-gray-800">NPR {item.estimatedValue}</p></div>
                  <div><p className="text-sm text-gray-500">Location</p><p className="font-semibold text-gray-800">{item.location}</p></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="p-6">
                {claimRequests.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <HiUser size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No claim requests yet</p>
                    <p className="text-sm mt-1">Requests from users claiming this item will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">
                      <strong className="text-gray-900">{claimRequests.length}</strong> user{claimRequests.length !== 1 ? "s" : ""} claiming this item
                    </p>
                    {claimRequests.map((req, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-gray-200">
                          {req.profilePicture ? (
                            <Image src={`${BASE_URL}${req.profilePicture}`} alt={req.fullName} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-[#1B2A4F]/5 flex items-center justify-center">
                              <span className="text-[#E85D4A] font-bold text-sm">{req.fullName?.charAt(0)?.toUpperCase() || "?"}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-gray-900">{req.fullName}</span>
                          <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                            <HiMail size={14} /> {req.email}
                          </p>
                          <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 mb-1">Proof provided:</p>
                            <p className="text-sm text-gray-700">{req.proofDescription}</p>
                          </div>
                          <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                            <HiClock size={12} /> Requested {new Date(req.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-lg p-6 text-white ${item.status === "Unclaimed" ? "bg-green-600" : "bg-[#1B2A4F]"}`}>
            <p className="text-sm opacity-90 mb-2">Current Status</p>
            <p className="text-3xl font-bold mb-4">{item.status}</p>
            {item.status === "Claimed" && item.claimedBy && (
              <div className="bg-white/20 rounded-lg p-4 mt-4">
                <p className="text-sm opacity-90 mb-2">Claimed By</p>
                <p className="font-semibold">{item.claimedBy.fullName}</p>
                <p className="text-sm opacity-90">{item.claimedBy.email}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {item.status === "Unclaimed" ? (
              <button onClick={() => setShowUpdateModal(true)} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition">
                <HiCheckCircle /> Mark as Claimed
              </button>
            ) : (
              <button onClick={handleMarkUnclaimed} disabled={updatingStatus} className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-60 transition">
                <HiCheckCircle /> Mark as Unclaimed
              </button>
            )}
            <Link href={`/admin/found-items/${id}/edit`} className="w-full flex items-center justify-center gap-2 bg-[#1B2A4F] text-white py-3 rounded-lg hover:bg-[#233459] font-semibold transition">
              <HiPencil /> Edit Item
            </Link>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 bg-[#1B2A4F] text-white py-3 rounded-lg hover:bg-[#233459] font-semibold transition">
              <HiTrash /> Delete Item
            </button>
          </div>

          <div className="text-gray-500 text-sm space-y-1 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Item Reference ID</p>
              <p className="text-sm font-semibold text-gray-800 break-all mt-1">{item._id}</p>
            </div>
            <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Mark as Claimed</h2>
            <p className="text-sm text-gray-500 mb-4">Select the user who is claiming this item</p>
            {claimRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HiUser size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No claim requests yet</p>
                <p className="text-sm mt-1">No users have claimed this item</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {claimRequests.map((req, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedUser(req.userId)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition flex items-center gap-3 ${selectedUser === req.userId ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border border-gray-200">
                      {req.profilePicture ? (
                        <Image src={`${BASE_URL}${req.profilePicture}`} alt={req.fullName} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-[#1B2A4F]/5 flex items-center justify-center">
                          <span className="text-[#E85D4A] font-bold text-xs">{req.fullName?.charAt(0)?.toUpperCase() || "?"}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{req.fullName}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{req.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowUpdateModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={updatingStatus || !selectedUser} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-60">
                {updatingStatus ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#E85D4A] mb-4">Delete Item</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
