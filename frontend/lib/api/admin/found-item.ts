import { API } from "../endpoints";
import axios from "../axios";

export interface FoundItem {
  _id: string;
  itemCategory: string;
  condition: string;
  brandColor: string;
  estimatedValue: number;
  location: string;
  description: string;
  photos: string[];
  status: 'Unclaimed' | 'Claimed';
  claimedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getAllFoundItems = async () => {
  try {
    const response = await axios.get(API.FOUND_ITEMS.GET_ALL);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch found items'
    );
  }
};

export const getFoundItemById = async (postId: string) => {
  try {
    const response = await axios.get(API.FOUND_ITEMS.GET_BY_ID(postId));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch found item'
    );
  }
};

export const createFoundItem = async (postData: FormData) => {
  try {
    const response = await axios.post(API.FOUND_ITEMS.CREATE, postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create found item'
    );
  }
};

export const updateFoundItem = async (postId: string, postData: FormData) => {
  try {
    const response = await axios.put(API.FOUND_ITEMS.UPDATE(postId), postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update found item'
    );
  }
};

export const updateFoundItemStatus = async (
  postId: string,
  status: 'Unclaimed' | 'Claimed',
  claimedBy?: string
) => {
  try {
    const response = await axios.put(API.FOUND_ITEMS.UPDATE_STATUS(postId), {
      status,
      claimedBy,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update item status'
    );
  }
};

export const deleteFoundItem = async (postId: string) => {
  try {
    const response = await axios.delete(API.FOUND_ITEMS.DELETE(postId));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete found item'
    );
  }
};

export const getFoundItemsByCategory = async (category: string) => {
  try {
    const response = await axios.get(API.FOUND_ITEMS.BY_CATEGORY(category));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch items by category'
    );
  }
};
