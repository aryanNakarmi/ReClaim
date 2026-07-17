import { CreateFoundItemDTO, UpdateFoundItemDTO, UpdateFoundItemStatusDTO } from "../dtos/founditem.dto";
import { FoundItemRepository } from "../repositories/founditem.repository";
import { HttpError } from "../errors/http-error";
import { IFoundItem } from "../models/founditem.model";

let foundItemRepository = new FoundItemRepository();

export class FoundItemService {
  async createPost(data: CreateFoundItemDTO): Promise<IFoundItem> {
    try {
      if (!data.itemCategory || !data.condition || !data.brandColor || !data.estimatedValue || !data.location || !data.description) {
        throw new HttpError(400, "All required fields must be provided");
      }

      if (!data.photos || data.photos.length === 0) {
        throw new HttpError(400, "At least one photo is required");
      }

      if (data.photos.length > 5) {
        throw new HttpError(400, "Maximum 5 photos allowed");
      }

      const postData: Partial<IFoundItem> = {
        itemCategory: data.itemCategory,
        condition: data.condition as "New" | "Like New" | "Good" | "Fair" | "Damaged",
        brandColor: data.brandColor, 
        estimatedValue: data.estimatedValue,
        location: data.location,
        description: data.description,
        photos: data.photos,
        status: "Unclaimed",
      };

      const newPost = await foundItemRepository.createPost(postData as any);
      return newPost;
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to create found item post");
    }
  }

  async getAllPosts(): Promise<IFoundItem[]> {
    try {
      return await foundItemRepository.getAllPosts();
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to fetch found items");
    }
  }

  async getMyClaims(userId: string): Promise<IFoundItem[]> {
    try {
      if (!userId) throw new HttpError(400, "User ID is required");
      return await foundItemRepository.getMyClaims(userId);
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to fetch your claims");
    }
  }

  async getPostsByCategory(category: string): Promise<IFoundItem[]> {
    try {
      if (!category) throw new HttpError(400, "Category is required");
      return await foundItemRepository.getPostsByCategory(category);
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to fetch items by category");
    }
  }

  async getPostById(id: string): Promise<IFoundItem> {
    try {
      if (!id) throw new HttpError(400, "Post ID is required");
      const post = await foundItemRepository.getPostById(id);
      if (!post) throw new HttpError(404, "Found item not found");
      return post;
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to fetch found item");
    }
  }

  async updatePost(id: string, data: UpdateFoundItemDTO): Promise<IFoundItem> {
    try {
      if (!id) throw new HttpError(400, "Post ID is required");

      const post = await foundItemRepository.getPostById(id);
      if (!post) throw new HttpError(404, "Found item not found");

      const updateData: Partial<IFoundItem> = {
        itemCategory: data.itemCategory ?? post.itemCategory,
        condition: (data.condition ?? post.condition) as "New" | "Like New" | "Good" | "Fair" | "Damaged",
        brandColor: data.brandColor ?? post.brandColor,
        estimatedValue: data.estimatedValue ?? post.estimatedValue,
        location: data.location ?? post.location,
        description: data.description ?? post.description,
        photos: data.photos ?? post.photos,
      };

      const updatedPost = await foundItemRepository.updatePost(id, updateData as any);
      return updatedPost!;
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to update found item");
    }
  }

  async updatePostStatus(id: string, data: UpdateFoundItemStatusDTO): Promise<IFoundItem> {
    try {
      if (!id) throw new HttpError(400, "Post ID is required");

      if (!data.status || !["Unclaimed", "Claimed"].includes(data.status)) {
        throw new HttpError(400, "Invalid status. Must be Unclaimed or Claimed");
      }

      const post = await foundItemRepository.getPostById(id);
      if (!post) throw new HttpError(404, "Found item not found");

      const updatedPost = await foundItemRepository.updatePostStatus(id, data.status, data.claimedBy);
      return updatedPost!;
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to update item status");
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      if (!id) throw new HttpError(400, "Post ID is required");
      const post = await foundItemRepository.getPostById(id);
      if (!post) throw new HttpError(404, "Found item not found");
      await foundItemRepository.deletePost(id);
    } catch (error: any) {
      throw new HttpError(error.statusCode ?? 500, error.message || "Failed to delete found item");
    }
  }
}

export const foundItemService = new FoundItemService();
