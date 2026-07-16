'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { handleGetFoundItemById } from '@/lib/actions/found-item-action';
import EditFoundItemForm from '@/app/admin/found-items/_components/EditFoundItemForm';

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

export default function EditFoundItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItem(); }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await handleGetFoundItemById(id);
      if (response.success) setItem(response.data);
      else {
        toast.error(response.message || 'Failed to load item');
        router.push('/admin/found-items');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load item');
      router.push('/admin/found-items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E85D4A]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Found item not found</p>
        <button onClick={() => router.push('/admin/found-items')} className="mt-4 px-6 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] transition">
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Found Item</h1>
      <EditFoundItemForm item={item} itemId={item._id} />
    </div>
  );
}
