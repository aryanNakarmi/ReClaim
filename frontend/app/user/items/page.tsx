'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiX, HiEye, HiSearch, HiFilter } from 'react-icons/hi';
import axios from '@/lib/api/axios';
import { API } from '@/lib/api/endpoints';
 
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

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
  createdAt: string;
  updatedAt: string;
}

const CONDITION_OPTIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Damaged'];

export default function ItemsPage() {
  const [allPosts, setAllPosts] = useState<FoundItem[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Unclaimed' | 'Claimed'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allResponse = await axios.get(API.FOUND_ITEMS.GET_ALL);
        setAllPosts(allResponse.data.data || []);
      } catch {
        toast.error('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let updated = [...allPosts];
    if (statusFilter !== 'All') updated = updated.filter((p) => p.status === statusFilter);
    if (categoryFilter !== 'All') updated = updated.filter((p) => p.itemCategory.toLowerCase() === categoryFilter.toLowerCase());
    if (conditionFilter !== 'All') updated = updated.filter((p) => p.condition === conditionFilter);
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      updated = updated.filter((item) =>
        [item._id, item.brandColor, item.location, item.itemCategory, item.condition, item.description]
          .filter(Boolean).some((field) => field.toLowerCase().includes(query))
      );
    }
    setFilteredPosts(updated);
  }, [allPosts, statusFilter, categoryFilter, conditionFilter, searchQuery]);

  const clearFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setConditionFilter('All');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    statusFilter !== 'All',
    categoryFilter !== 'All',
    conditionFilter !== 'All',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const categoryOptions = [
    'All',
    ...Array.from(new Set(allPosts.map((p) => p.itemCategory?.trim()).filter(Boolean))).sort(),
  ];

  const getStatusColor = (status: string) =>
    status === 'Unclaimed'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-blue-100 text-blue-800 border-blue-300';

  const FilterPanel = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <HiFilter size={14} /> Filters
        </span>
        {activeFiltersCount > 0 && (            <button onClick={clearFilters} className="text-xs text-[#E85D4A] hover:text-[#d04a38] font-medium transition">
            Clear all
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-[#1B2A4F] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30"
          >
            {categoryOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Condition</p>
          <div className="space-y-2">
            {CONDITION_OPTIONS.map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="condition" value={g} checked={conditionFilter === g} onChange={() => setConditionFilter(g)} className="accent-[#E85D4A] w-3.5 h-3.5" />
                <span className={`text-sm transition ${conditionFilter === g ? 'text-[#E85D4A] font-semibold' : 'text-[#4A5568]'}`}>{g}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</p>
          <div className="space-y-2">
            {(['All', 'Unclaimed', 'Claimed'] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" name="status" value={s} checked={statusFilter === s} onChange={() => setStatusFilter(s)} className="accent-[#E85D4A] w-3.5 h-3.5" />
                <span className={`text-sm transition ${statusFilter === s ? 'text-[#E85D4A] font-semibold' : 'text-[#4A5568]'}`}>{s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#1B2A4F]">Browse Found Items</h1>
        <p className="text-sm text-[#4A5568] mt-0.5">Look through items that have been found and reported</p>
      </div>

      <div className="relative w-full">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by brand, category, location..."
          className="w-full pl-11 pr-10 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-[#1B2A4F] placeholder-[#4A5568] bg-white text-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <HiX size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          Showing <span className="text-[#E85D4A]">{filteredPosts.length}</span> of {allPosts.length} items
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
        >
          <HiFilter size={14} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 bg-[#E85D4A] text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {filterOpen && (
        <div className="block">
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E85D4A]" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg mb-4">
                {activeFiltersCount > 0
                  ? 'No items match your filters'
                  : 'No found items listed yet'}
              </p>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="inline-flex items-center gap-2 bg-[#1B2A4F] text-white px-5 py-2.5 rounded-lg hover:bg-[#233459] transition font-medium">
                  <HiX size={18} /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredPosts.map((item) => (
                <div key={item._id} className="rounded-xl shadow-md border border-gray-200 overflow-hidden transition transform hover:scale-[1.02] hover:shadow-xl bg-white">
                  <div className="relative h-44 bg-gray-200">
                    {item.photos?.[0] ? (
                      <Image src={`${BASE_URL}${item.photos[0]}`} alt={item.brandColor} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-600 font-medium text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold border-2 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{item.brandColor}</h3>
                      <p className="text-sm text-gray-500">{item.itemCategory} • {item.condition} • NPR {item.estimatedValue}</p>
                    </div>
                    <p className="text-sm text-gray-600">{item.location}</p>
                    <p className="text-gray-700 text-sm line-clamp-2">{item.description}</p>
                    <Link href={`/user/items/${item._id}`} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#1B2A4F]/5 text-[#1B2A4F] rounded hover:bg-[#1B2A4F]/10 transition text-sm font-medium">
                      <HiEye size={16} /> View Details
                    </Link>
                    <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                      Posted: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="hidden md:block w-52 flex-shrink-0 sticky top-4">
          <FilterPanel />
        </aside>
      </div>
    </div>
  );
}
