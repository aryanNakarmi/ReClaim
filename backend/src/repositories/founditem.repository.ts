import { FoundItemModel, IFoundItem } from "../models/founditem.model";
import { FoundItemType } from "../types/founditem.type";

export interface IFoundItemRepository {
  createPost(postData: Partial<FoundItemType>): Promise<IFoundItem>;
  getPostById(id: string): Promise<IFoundItem | null>;
  getAllPosts(): Promise<IFoundItem[]>;
  getMyClaims(userId: string): Promise<IFoundItem[]>;
  getPostsByCategory(category: string): Promise<IFoundItem[]>;
  updatePostStatus(
    id: string,
    status: "Unclaimed" | "Claimed",
    claimedBy?: string
  ): Promise<IFoundItem | null>;
  updatePost(id: string, updateData: Partial<FoundItemType>): Promise<IFoundItem | null>;
  deletePost(id: string): Promise<boolean>;
}

export class FoundItemRepository implements IFoundItemRepository {
  async createPost(postData: Partial<FoundItemType>): Promise<IFoundItem> {
    const post = new FoundItemModel(postData);
    return await post.save();
  }

  async getPostById(id: string): Promise<IFoundItem | null> {
    return await FoundItemModel.findById(id).populate("claimedBy", "fullName email");
  }

  async getAllPosts(): Promise<IFoundItem[]> {
    return await FoundItemModel.find()
      .populate("claimedBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  async getMyClaims(userId: string): Promise<IFoundItem[]> {
    return await FoundItemModel.find({
      claimedBy: userId,
    })
      .populate("claimedBy", "fullName email")
      .sort({ updatedAt: -1 });
  }

  async getPostsByCategory(category: string): Promise<IFoundItem[]> {
    return await FoundItemModel.find({
      itemCategory: { $regex: category, $options: "i" },
    })
      .populate("claimedBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  async updatePostStatus(
    id: string,
    status: "Unclaimed" | "Claimed",
    claimedBy?: string
  ): Promise<IFoundItem | null> {
    const update: any = { status };

    if (status === "Claimed") {
      update.claimedBy = claimedBy || null;
      update.claimedDate = new Date();
    } else {
      update.claimedBy = null;
      update.claimedDate = null;
    }

    return await FoundItemModel.findByIdAndUpdate(id, update, { new: true }).populate(
      "claimedBy",
      "fullName email"
    );
  }

  async updatePost(id: string, updateData: Partial<FoundItemType>): Promise<IFoundItem | null> {
    return await FoundItemModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await FoundItemModel.findByIdAndDelete(id);
    return !!result;
  }
}

export const foundItemRepository = new FoundItemRepository();
