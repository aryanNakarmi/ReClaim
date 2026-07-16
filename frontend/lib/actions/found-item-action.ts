"use server";

import {
  getAllFoundItems,
  getFoundItemById,
  createFoundItem,
  updateFoundItem,
  updateFoundItemStatus,
  deleteFoundItem,
  getFoundItemsByCategory,
} from "@/lib/api/admin/found-item"
import { revalidatePath } from "next/cache";

export const handleGetAllFoundItems = async () => {
  try {
    const response = await getAllFoundItems();
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch items",
      data: [],
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch found items",
      data: [],
    };
  }
};

export const handleGetFoundItemById = async (postId: string) => {
  try {
    const response = await getFoundItemById(postId);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch item",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch found item",
      data: null,
    };
  }
};

export const handleCreateFoundItem = async (formData: FormData) => {
  try {
    const response = await createFoundItem(formData);
    if (response.success) {
      revalidatePath("/admin/found-items");
      return {
        success: true,
        message: "Found item posted successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to create item",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to create found item",
      data: null,
    };
  }
};

export const handleUpdateFoundItem = async (postId: string, formData: FormData) => {
  try {
    const response = await updateFoundItem(postId, formData);
    if (response.success) {
      revalidatePath("/admin/found-items");
      revalidatePath(`/admin/found-items/${postId}`);
      return {
        success: true,
        message: "Found item updated successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to update item",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to update found item",
      data: null,
    };
  }
};

export const handleUpdateFoundItemStatus = async (
  postId: string,
  status: 'Unclaimed' | 'Claimed',
  claimedBy?: string
) => {
  try {
    const response = await updateFoundItemStatus(postId, status, claimedBy);
    if (response.success) {
      revalidatePath("/admin/found-items");
      return {
        success: true,
        message: "Item status updated successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to update status",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to update item status",
      data: null,
    };
  }
};

export const handleDeleteFoundItem = async (postId: string) => {
  try {
    const response = await deleteFoundItem(postId);
    if (response.success) {
      revalidatePath("/admin/found-items");
      return {
        success: true,
        message: "Found item deleted successfully",
      };
    }
    return {
      success: false,
      message: response.message || "Failed to delete item",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to delete found item",
    };
  }
};

export const handleGetFoundItemsByCategory = async (category: string) => {
  try {
    const response = await getFoundItemsByCategory(category);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch items",
      data: [],
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch items by category",
      data: [],
    };
  }
};
