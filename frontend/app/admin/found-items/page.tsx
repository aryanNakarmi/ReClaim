'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiPlus, HiEye } from 'react-icons/hi';
import { HiHandRaised } from 'react-icons/hi2';
import { handleGetAllFoundItems } from '@/lib/actions/found-item-action';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5050';

interface ClaimRequest {
  userId: string;
  fullName: string;
  email: string;
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
  status: 'Unclaimed' | 'Claimed';
  claimedBy?: { _id: string; fullName: string; email: string };
  claimRequests?: ClaimRequest[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminFoundItemsPage() {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Unclaimed' | 'Claimed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await handleGetAllFoundItems();
      if (response.success) setItems(response.data);
      else toast.error(response.message || 'Failed to load items');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedStatus === 'all' ? items : items.filter((p) => p.status === selectedStatus);
  const searchedItems = filteredItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return item._id.toLowerCase().includes(query) || item.brandColor.toLowerCase().includes(query) || item.itemCategory.toLowerCase().includes(query);
  });

  const getStatusColor = (status: string) =>
    status === 'Unclaimed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-100 text-blue-800 border-blue-300';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Found Items</h1>
          <p className="text-gray-500 mt-1">Manage all found item listings</p>
        </div>
        <Link href="/admin/found-items/create" className="flex items-center gap-2 bg-[#1B2A4F] text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-[#233459] transition">
          <HiPlus size={18} /> Post Found Item
        </Link>
      </div>

      <div className="flex justify-end relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by brand or category..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 focus:border-[#1B2A4F] mb-3 text-black placeholder-black/50 pr-10"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-5 -translate-y-1/2 text-gray-400 hover:text-gray-700">&#10005;</button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-3 rounded-lg border border-gray-200">
        {(['all', 'Unclaimed', 'Claimed'] as const).map((status) => {
          const label = status === 'all' ? `All Items (${items.length})` : `${status} (${items.filter((p) => p.status === status).length})`;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-1.5 rounded-lg font-medium transition ${selectedStatus === status ? 'bg-[#1B2A4F] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E85D4A]" />
        </div>
      ) : searchedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-black text-lg mb-4">No items found</p>
          <Link href="/admin/found-items/create" className="inline-flex items-center gap-2 bg-[#1B2A4F] text-white px-5 py-2.5 rounded-lg hover:bg-[#233459] transition font-medium">
            <HiPlus size={18} /> Post Found Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {searchedItems.map((item) => {
            const requestCount = item.claimRequests?.length ?? 0;
            const hasRequests = requestCount > 0 && item.status === 'Unclaimed';
            return (
              <div key={item._id} className="rounded-xl shadow-md border border-gray-200 overflow-hidden transition transform hover:scale-105 hover:shadow-lg bg-white">
                <div className="relative h-40 bg-gray-200">
                  {item.photos?.[0] ? (
                    <Image src={`${BASE_URL}${item.photos[0]}`} alt={item.brandColor} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-600 font-medium text-sm">No Image</span>
                    </div>
                  )}
                  {item.photos?.length > 0 && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-bold">
                      {item.photos.length} photos
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold border-2 ${getStatusColor(item.status)}`}>
                      {item.status}
                    </div>
                  </div>
                  {hasRequests && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#E85D4A] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      <HiHandRaised size={11} />
                      {requestCount} claim{requestCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{item.brandColor}</h3>
                    <p className="text-sm text-gray-500">{item.itemCategory} • {item.condition} • NPR {item.estimatedValue}</p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>{item.location}</p>
                    {item.claimedBy && item.status === 'Claimed' && (
                      <p className="text-xs text-[#1B2A4F] font-semibold">Claimed by: {item.claimedBy.fullName}</p>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">{item.description}</p>
                  <Link
                    href={`/admin/found-items/${item._id}`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-100 text-[#1B2A4F] rounded-lg hover:bg-[#1B2A4F]/10 transition text-sm font-medium"
                  >
                    <HiEye size={16} />
                    View Details
                    {hasRequests && (
                      <span className="bg-[#E85D4A] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {requestCount}
                      </span>
                    )}
                  </Link>
                  <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
