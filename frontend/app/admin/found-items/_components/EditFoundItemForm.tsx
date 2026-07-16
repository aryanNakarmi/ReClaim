'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { HiX, HiPlus } from 'react-icons/hi';
import { handleUpdateFoundItem } from '@/lib/actions/found-item-action';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Damaged'];

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

interface FormData {
  itemCategory: string;
  condition: string;
  brandColor: string;
  estimatedValue: string;
  location: string;
  description: string;
}

interface EditFoundItemFormProps {
  item: FoundItem;
  itemId: string;
}

export default function EditFoundItemForm({ item, itemId }: EditFoundItemFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(item.photos || []);

  const [formData, setFormData] = useState<FormData>({
    itemCategory: item.itemCategory,
    condition: item.condition,
    brandColor: item.brandColor,
    estimatedValue: item.estimatedValue.toString(),
    location: item.location,
    description: item.description,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === "itemCategory") {
      formattedValue = value.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = existingPhotos.length + selectedPhotos.length + files.length;
    if (totalPhotos > 5) {
      toast.error(`Maximum 5 photos allowed. You have ${existingPhotos.length + selectedPhotos.length} existing photos.`);
      return;
    }
    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });
    setSelectedPhotos((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewPhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemCategory || !formData.condition || !formData.brandColor || !formData.estimatedValue || !formData.location || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    if (existingPhotos.length === 0 && selectedPhotos.length === 0) {
      toast.error('Please keep at least one photo or upload new ones');
      return;
    }
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('itemCategory', formData.itemCategory);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('brandColor', formData.brandColor);
      formDataToSend.append('estimatedValue', formData.estimatedValue);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      existingPhotos.forEach((photo) => formDataToSend.append('existingPhotos', photo));
      if (selectedPhotos.length > 0) {
        selectedPhotos.forEach((photo) => formDataToSend.append('foundItem', photo));
      }
      const response = await handleUpdateFoundItem(itemId, formDataToSend);
      if (response.success) {
        toast.success('Found item updated successfully!');
        router.push(`/admin/found-items/${itemId}`);
      } else {
        toast.error(response.message || 'Failed to update item');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 space-y-6">
        {existingPhotos.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Current Photos ({existingPhotos.length})</label>
            <p className="text-xs text-gray-500 mb-3">Click the X to remove photos you don't want</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-32">
                    <Image src={`http://localhost:5050${photo}`} alt={`Existing ${index + 1}`} fill className="rounded-lg object-cover" unoptimized />
                  </div>
                  <button type="button" onClick={() => removeExistingPhoto(index)} className="absolute -top-2 -right-2 bg-[#1B2A4F] text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" title="Remove this photo">
                    <HiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Add More Photos (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center gap-2">
              <HiPlus size={32} className="text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Upload Additional Photos</p>
              <p className="text-xs text-gray-500">Maximum 5 total photos. Current: {existingPhotos.length + selectedPhotos.length}</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] transition font-medium">Choose Photos</button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </div>
            {photoPreviews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32">
                      <Image src={preview} alt={`New ${index + 1}`} fill className="rounded-lg object-cover" />
                    </div>
                    <button type="button" onClick={() => removeNewPhoto(index)} className="absolute -top-2 -right-2 bg-[#1B2A4F] text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <HiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Category *</label>
            <input type="text" name="itemCategory" value={formData.itemCategory} onChange={handleInputChange} placeholder="e.g., Phone, Wallet, Keys" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-gray-900 hover:border-gray-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
            <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-gray-900 font-medium hover:border-gray-400 transition">
              <option value="">-- Select Condition --</option>
              {CONDITIONS.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand / Color *</label>
            <input type="text" name="brandColor" value={formData.brandColor} onChange={handleInputChange} placeholder="e.g., Silver iPhone 15 Pro" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-gray-900 hover:border-gray-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value (NPR) *</label>
            <input type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleInputChange} placeholder="e.g., 50000" min="0" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-gray-900 hover:border-gray-400 transition" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Kathmandu, Nepal" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-gray-900 hover:border-gray-400 transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the item in detail" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-gray-900 resize-none hover:border-gray-400 transition" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-[#1B2A4F] text-white font-bold rounded-lg hover:bg-[#233459] transition disabled:opacity-60">
          {loading ? 'Updating...' : 'Update Item'}
        </button>
      </div>
    </form>
  );
}
