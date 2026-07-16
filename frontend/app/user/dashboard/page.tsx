"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Fragment, useEffect } from "react";
import { HiArrowRight } from "react-icons/hi";
import { toast } from "react-toastify";
import { getMyReports, LostItemReport } from "@/lib/api/lost-item/lost-item";
import { Dialog, Transition } from "@headlessui/react";



export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<LostItemReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getMyReports(1, 4);
        
        if (response.success) {
          setReports(response.data || []);
        } else {
          toast.error(response.message || "Failed to load reports");
        }
      } catch (error) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-[#1B2A4F]/5 text-[#E85D4A]";
      case "pending":
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/images/heropup.jpg"
          alt="Help reunite lost items"
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Bottom half overlay only */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/50 flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Lost or found something?
          </h1>
          <p className="text-white/90 mb-4 max-w-xl">
            Every item has an owner. Help us reunite what's lost with who it belongs to.
          </p>

          {/* Button on bottom-left */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start bg-[#E85D4A] text-white px-5 py-2 rounded font-semibold hover:bg-[#d04a38] transition text-sm"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="flex items-center justify-center min-h-screen px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Help Reunite
                </Dialog.Title>

                <Dialog.Description className="mt-2 text-gray-700">
                  Every item tells a story. Report what you found or browse lost items to help someone reclaim what matters to them.
                </Dialog.Description>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-[#E85D4A] text-white px-4 py-2 rounded hover:bg-[#d04a38] transition text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* ===== BROWSE ITEMS BAR ===== */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B2A4F] rounded flex items-center justify-center text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-[#1B2A4F] text-sm">Browse Found Items</h2>
            <p className="text-[#4A5568] text-xs">See what items have been found and reported</p>
          </div>
        </div>
        <Link
          href="/user/items"
          className="bg-[#E85D4A] text-white px-4 py-1.5 rounded font-semibold hover:bg-[#d04a38] transition text-sm"
        >
          Browse
        </Link>
      </div>

      {/* ===== My Reports Section ===== */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg">My Reports</h2>
          <Link
            href="/user/my-reports"
            className="text-[#E85D4A] hover:text-[#d04a38] font-semibold text-sm flex items-center gap-1 transition"
          >
            View All
            <HiArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2A4F]"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <p className="text-gray-500 font-medium">No reports yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start by creating your first lost item report
            </p>
            <Link
              href="/user/report-lost"
              className="inline-block mt-4 bg-[#E85D4A] text-white px-5 py-2 rounded font-semibold hover:bg-[#d04a38] transition text-sm"
            >
              Create Report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition"
              >
                {/* IMAGE ON TOP */}
                <div className="w-full h-40 relative overflow-hidden bg-gray-200">
                  {report.imageUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                      alt={report.itemCategory}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}

                  {/* STATUS BADGE */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusText(report.status)}
                    </span>
                  </div>
                </div>

                {/* TEXT BELOW */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 capitalize">
                    {report.itemCategory}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    {report.location.address}
                  </p>
                  {report.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {report.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}