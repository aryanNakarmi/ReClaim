'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiArrowLeft, HiHeart, HiCheckCircle, HiX } from "react-icons/hi";
import axios from "@/lib/api/axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:5050";

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
  claimRequests?: { userId: string }[];
  createdAt: string;
  updatedAt: string;
}

const getCurrentUserId = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith("auth_token=")) {
      try {
        const token = decodeURIComponent(c.substring("auth_token=".length));
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id || payload._id || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

export default function UserItemDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [claimProof, setClaimProof] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  const currentUserId = getCurrentUserId();

  const hasRequested = !!(
    currentUserId &&
    item?.claimRequests?.some((r) => r.userId === currentUserId)
  );
  const interestedCount = item?.claimRequests?.length || 0;

  useEffect(() => {
    if (!id) return;
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/found-items/${id}`);
      setItem(res.data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClaim = async () => {
    if (!claimProof.trim()) {
      toast.error("Please describe your item as proof");
      return;
    }
    setShowProofModal(false);
    try {
      setRequesting(true);
      const res = await axios.post(`${BASE_URL}/api/v1/found-items/${id}/request-claim`, { proofDescription: claimProof.trim() });
      if (res.data.success) {
        toast.success("Claim request sent! The admin will review it.");
        fetchItem();
      } else {
        toast.error(res.data.message || "Failed to send request");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    setShowCancelModal(false);
    try {
      setCancelling(true);
      const res = await axios.delete(`${BASE_URL}/api/v1/found-items/${id}/request-claim`);
      if (res.data.success) {
        toast.success("Claim request cancelled");
        fetchItem();
      } else {
        toast.error(res.data.message || "Failed to cancel");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };

  const nextPhoto = () => {
    if (item?.photos) setCurrentPhotoIndex((p) => (p + 1) % item.photos.length);
  };
  const prevPhoto = () => {
    if (item?.photos) setCurrentPhotoIndex((p) => (p - 1 + item.photos.length) % item.photos.length);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E85D4A]" />
      </div>
    );

  if (!item)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Item not found.{" "}
        <Link href="/user/items" className="text-[#E85D4A] hover:underline">Back to Browse</Link>
      </div>
    );

  return (
    <div className="flex flex-col h-full gap-4 p-4 lg:p-6 overflow-hidden">
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/user/items" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <HiArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{item.brandColor}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
          item.status === "Unclaimed"
            ? "bg-green-100 text-green-800 border-green-300"
            : "bg-blue-100 text-blue-800 border-blue-300"
        }`}>
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          <div className="relative w-full h-64 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            {item.photos.length > 0 ? (
              <Image src={`${BASE_URL}${item.photos[currentPhotoIndex]}`} alt={item.brandColor} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
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
            <div className="flex gap-2 overflow-x-auto flex-shrink-0">
              {item.photos.map((photo, i) => (
                <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    currentPhotoIndex === i ? "border-[#E85D4A]" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image src={`${BASE_URL}${photo}`} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-5 space-y-4 flex-shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Category</p><p className="font-semibold text-gray-800 text-sm">{item.itemCategory}</p></div>
              <div><p className="text-xs text-gray-500">Condition</p><p className="font-semibold text-gray-800 text-sm">{item.condition}</p></div>
              <div><p className="text-xs text-gray-500">Est. Value</p><p className="font-semibold text-gray-800 text-sm">NPR {item.estimatedValue}</p></div>
              <div><p className="text-xs text-gray-500">Location</p><p className="font-semibold text-gray-800 text-sm">{item.location}</p></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
          <div className={`rounded-lg p-5 text-white flex-shrink-0 ${item.status === "Unclaimed" ? "bg-green-600" : "bg-[#1B2A4F]"}`}>
            <p className="text-sm opacity-90 mb-1">Current Status</p>
            <p className="text-2xl font-bold">{item.status}</p>
            <p className="text-xs opacity-80 mt-1">
              {item.status === "Unclaimed" ? "This item is waiting to be claimed" : "This item has been claimed"}
            </p>
          </div>

          {item.status === "Unclaimed" && (
            <div className="bg-white rounded-lg shadow-lg p-5 space-y-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-800">Is this yours?</h3>
              {interestedCount > 0 && (
                <div className="flex items-center gap-2 text-[#E85D4A] text-sm font-semibold">
                  <HiHeart size={16} />
                  {interestedCount} {interestedCount === 1 ? "person" : "people"} have claimed this
                </div>
              )}
              {hasRequested ? (
                <>
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <HiCheckCircle className="text-green-600 flex-shrink-0" size={18} />
                    <p className="text-sm text-green-700 font-medium">Your claim request is pending review.</p>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center gap-2 border border-red-300 text-[#E85D4A] hover:bg-[#F0EDE6] py-2 rounded-lg font-semibold transition text-sm disabled:opacity-60"
                  >
                    <HiX size={15} />
                    {cancelling ? "Cancelling..." : "Cancel Request"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    If this item belongs to you, send a claim request. Describe the item to prove ownership.
                  </p>
                  <button
                    onClick={() => setShowProofModal(true)}
                    disabled={requesting}
                    className="w-full flex items-center justify-center gap-2 bg-[#1B2A4F] hover:bg-[#233459] text-white py-2.5 rounded-lg font-semibold transition text-sm disabled:opacity-60"
                  >
                    <HiHeart size={16} />
                    {requesting ? "Sending..." : "Claim This Item"}
                  </button>
                </>
              )}
            </div>
          )}

          {item.status === "Claimed" && (
            <div className="bg-[#F0EDE6] border border-blue-200 rounded-lg p-5 flex-shrink-0">
              <div className="flex items-center gap-2 text-blue-700">
                <HiHeart size={20} />
                <p className="font-semibold text-sm">This item has already been claimed.</p>
              </div>
            </div>
          )}

          <div className="text-gray-400 text-xs space-y-1 pt-3 border-t border-gray-200 flex-shrink-0">
            <p>Posted: {new Date(item.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Proof Description Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Describe Your Item</h2>
            <p className="text-gray-500 text-sm mb-4">
              Please describe your item in detail to prove ownership (e.g., serial numbers, unique markings, etc.)
            </p>
            <textarea
              value={claimProof}
              onChange={(e) => setClaimProof(e.target.value)}
              placeholder="Describe your item..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#1B2A4F] focus:outline-none transition resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowProofModal(false); setClaimProof(""); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                Cancel
              </button>
              <button onClick={handleRequestClaim} disabled={!claimProof.trim()} className="flex-1 px-4 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] font-semibold disabled:opacity-60">
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Claim Request?</h2>
            <p className="text-gray-500 text-sm">Are you sure you want to withdraw your claim request?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                Keep Request
              </button>
              <button onClick={handleCancelRequest} className="flex-1 px-4 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] font-semibold">
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
