import { Request, Response } from "express";
import { foundItemService } from "../services/founditem.service";
import { FoundItemModel } from "../models/founditem.model";
import { UserModel } from "../models/user.model";
import { CreateFoundItemDTO, UpdateFoundItemDTO, UpdateFoundItemStatusDTO } from "../dtos/founditem.dto";
import { sendEmail } from "../config/email";
import z from "zod";

interface AuthRequest extends Request {
  user?: any;
}
 
export class FoundItemController {
  async createPost(req: Request, res: Response) {
    try {
      const { itemCategory, condition, brandColor, estimatedValue, location, description } = req.body;
      const photos = req.files ? (req.files as Express.Multer.File[]).map(f => `/found_items/${f.filename}`) : [];
      const parsedData = CreateFoundItemDTO.safeParse({ itemCategory, condition, brandColor, estimatedValue: parseInt(estimatedValue), location, description, photos });
      if (!parsedData.success) return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
      const newPost = await foundItemService.createPost(parsedData.data);
      return res.status(201).json({ success: true, message: "Found item posted successfully", data: newPost });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to create found item post" });
    }
  }

  async getAllPosts(req: Request, res: Response) {
    try {
      const posts = await foundItemService.getAllPosts();
      return res.status(200).json({ success: true, message: "Found items retrieved successfully", data: posts });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to fetch found items" });
    }
  }

  async getMyClaims(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });
      const posts = await foundItemService.getMyClaims(userId);
      return res.status(200).json({ success: true, message: "Your claims retrieved successfully", data: posts });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to fetch your claims" });
    }
  }

  async getPostsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      if (!category) return res.status(400).json({ success: false, message: "Category parameter is required" });
      const posts = await foundItemService.getPostsByCategory(category);
      return res.status(200).json({ success: true, message: "Found items retrieved successfully", data: posts });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to fetch found items by category" });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, message: "Post ID is required" });
      const post = await foundItemService.getPostById(id);
      return res.status(200).json({ success: true, message: "Found item retrieved successfully", data: post });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to fetch found item" });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, message: "Post ID is required" });
      const { itemCategory, condition, brandColor, estimatedValue, location, description } = req.body;
      let existingPhotosList: string[] = [];
      if (req.body.existingPhotos) {
        existingPhotosList = typeof req.body.existingPhotos === "string" ? [req.body.existingPhotos] : req.body.existingPhotos;
      }
      const newPhotos = req.files ? (req.files as Express.Multer.File[]).map(f => `/found_items/${f.filename}`) : [];
      const mergedPhotos = [...existingPhotosList, ...newPhotos];
      const updateData: any = { itemCategory, condition, brandColor, estimatedValue: estimatedValue ? parseInt(estimatedValue) : undefined, location, description, photos: mergedPhotos.length > 0 ? mergedPhotos : undefined };
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      const parsedData = UpdateFoundItemDTO.safeParse(updateData);
      if (!parsedData.success) return res.status(400).json({ success: false, message: parsedData.error.message });
      const post = await foundItemService.updatePost(id, parsedData.data);
      return res.status(200).json({ success: true, message: "Found item updated successfully", data: post });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to update found item" });
    }
  }

  async updatePostStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, message: "Post ID is required" });
      const { status, claimedBy } = req.body;
      const parsedData = UpdateFoundItemStatusDTO.safeParse({ status, claimedBy });
      if (!parsedData.success) return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });

      const post = await foundItemService.updatePostStatus(id, parsedData.data);

      // ── Send notification email to the claiming user ──
      if (status === "Claimed" && claimedBy) {
        try {
          const fullPost = await FoundItemModel.findById(id);
          const requester = fullPost?.claimRequests?.find(
            (r) => r.userId.toString() === claimedBy.toString()
          );
          const claimedPost = await FoundItemModel.findById(id).populate("claimedBy", "fullName email");
          const claimedUser = (claimedPost?.claimedBy as any) || requester;

          if (claimedUser?.email) {
            const html = `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
                  <h1 style="color:white;margin:0;font-size:26px;">Item Claimed!</h1>
                </div>
                <div style="background:#f9fafb;padding:30px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
                  <p style="font-size:16px;color:#374151;">Hi <strong>${claimedUser.fullName || requester?.fullName || "there"}</strong>,</p>
                  <p style="color:#6b7280;line-height:1.6;">
                    Great news! Your claim for the
                    <strong>${(post as any).brandColor} (${(post as any).itemCategory})</strong>
                    has been <span style="color:#1d4ed8;font-weight:bold;">approved</span>.
                  </p>
                  <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:15px;border-radius:4px;margin:20px 0;">
                    <p style="margin:0;color:#1e40af;font-weight:600;">
                      Our team will contact you soon with next steps for picking up your item.
                      Thank you for using ReClaim!
                    </p>
                  </div>
                  <p style="color:#9ca3af;font-size:13px;margin-top:30px;">— The ReClaim Team</p>
                </div>
              </div>
            `;
            sendEmail(
              claimedUser.email || requester?.email,
              `Your Claim is Approved — ${(post as any).brandColor} is yours!`,
              html
            ).catch((err) => console.error("Failed to send claim email:", err.message));
          }
        } catch (emailErr: any) {
          console.error("Email lookup failed:", emailErr.message);
        }
      }

      return res.status(200).json({ success: true, message: "Found item status updated successfully", data: post });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to update item status" });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, message: "Post ID is required" });
      await foundItemService.deletePost(id);
      return res.status(200).json({ success: true, message: "Found item deleted successfully", data: { _id: id } });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to delete found item" });
    }
  }

  // ===================== REQUEST CLAIM (USER) =====================
  async requestClaim(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const { proofDescription } = req.body;

      if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });
      if (!proofDescription || !proofDescription.trim()) {
        return res.status(400).json({ success: false, message: "Please provide a description of your item as proof" });
      }

      const post = await FoundItemModel.findById(id);
      if (!post) return res.status(404).json({ success: false, message: "Item not found" });

      if (post.status === "Claimed") {
        return res.status(400).json({ success: false, message: "This item has already been claimed" });
      }

      const alreadyRequested = post.claimRequests.some(
        (r) => r.userId.toString() === userId.toString()
      );
      if (alreadyRequested) {
        return res.status(400).json({ success: false, message: "You have already sent a claim request for this item" });
      }

      const fullUser = await UserModel.findById(userId).select("fullName email profilePicture").lean();
      const u = fullUser as any;

      post.claimRequests.push({
        userId,
        fullName: u?.fullName || req.user.fullName,
        email: u?.email || req.user.email,
        profilePicture: u?.profilePicture || null,
        proofDescription: proofDescription.trim(),
        requestedAt: new Date(),
      });

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Claim request sent successfully! The admin will review it.",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to send claim request" });
    }
  }

  // ===================== CANCEL CLAIM REQUEST (USER) =====================
  async cancelClaimRequest(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      const post = await FoundItemModel.findById(id);
      if (!post) return res.status(404).json({ success: false, message: "Item not found" });

      post.claimRequests = post.claimRequests.filter(
        (r) => r.userId.toString() !== userId.toString()
      );

      await post.save();

      return res.status(200).json({ success: true, message: "Claim request cancelled" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to cancel request" });
    }
  }

  // ===================== GET CLAIM REQUESTS (ADMIN) =====================
  async getClaimRequests(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const post = await FoundItemModel.findById(id).select("claimRequests brandColor itemCategory status");
      if (!post) return res.status(404).json({ success: false, message: "Item not found" });
      return res.status(200).json({
        success: true,
        message: "Claim requests fetched",
        count: post.claimRequests.length,
        data: post.claimRequests,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Failed to fetch requests" });
    }
  }
}
