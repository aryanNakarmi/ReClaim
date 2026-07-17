import { LostItemModel } from "../models/lostitem.model";
import { CreateLostItemDTO } from "../dtos/lostitem.dto";
import { Request, Response } from "express";
import z from "zod";
import fs from "fs";
import path from "path";
import { sendEmail } from "../config/email";

interface AuthRequest extends Request {
  user?: any;
} 

export class LostItemController {
  async uploadReportPhoto(req: AuthRequest, res: Response) {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "Please upload a photo" });
      return res
        .status(200)
        .json({
          success: true,
          message: "Photo uploaded successfully",
          data: `/lost_reports/${req.file.filename}`,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to upload photo",
        });
    }
  }

  async createReport(req: AuthRequest, res: Response) {
    try {
      const parsedData = CreateLostItemDTO.safeParse(req.body);
      if (!parsedData.success)
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      const { itemCategory, location, description, imageUrl } = parsedData.data;
      const report = await LostItemModel.create({
        itemCategory,
        location,
        description,
        imageUrl,
        reportedBy: req.user._id,
        status: "pending",
      });
      return res
        .status(201)
        .json({
          success: true,
          message: "Lost item report created successfully",
          data: report,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to create report",
        });
    }
  }

  async getAllReports(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const total = await LostItemModel.countDocuments({});
      const reports = await LostItemModel.find({})
        .populate("reportedBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return res
        .status(200)
        .json({
          success: true,
          message: "All lost item reports fetched successfully",
          count: reports.length,
          total,
          page,
          pages: Math.ceil(total / limit),
          data: reports,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to fetch reports",
        });
    }
  }

  async getReportById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "Report ID is required" });
      const report = await LostItemModel.findById(id).populate(
        "reportedBy",
        "fullName email",
      );
      if (!report)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      const reportedById =
        (report.reportedBy as any)?._id?.toString() ||
        report.reportedBy?.toString();
      if (
        report.status !== "approved" &&
        req.user._id.toString() !== reportedById &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You do not have permission to view this report",
          });
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "Report fetched successfully",
          data: report,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to fetch report",
        });
    }
  }

  async getMyReports(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const total = await LostItemModel.countDocuments({
        reportedBy: req.user._id,
      });
      const reports = await LostItemModel.find({ reportedBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return res
        .status(200)
        .json({
          success: true,
          message: "Your reports fetched successfully",
          count: reports.length,
          total,
          page,
          pages: Math.ceil(total / limit),
          data: reports,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to fetch your reports",
        });
    }
  }

  async updateReportStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      const report = await LostItemModel.findById(id).populate(
        "reportedBy",
        "fullName email",
      );
      if (!report)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });

      report.status = status;
      await report.save();

      // ── Email notification ──
      const user = report.reportedBy as any;
      if (user?.email) {
        const isApproved = status === "approved";
        const locationAddress =
          (report.location as any)?.address || "the reported location";

        const subject = isApproved
          ? `Your Lost Item Report Has Been Approved — ReClaim`
          : `Your Lost Item Report Has Been Rejected — ReClaim`;

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:${isApproved ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)"};padding:30px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="color:white;margin:0;font-size:26px;">${isApproved ? "Report Approved!" : "Report Rejected"}</h1>
            </div>
            <div style="background:#f9fafb;padding:30px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
              <p style="font-size:16px;color:#374151;">Hi <strong>${user.fullName}</strong>,</p>
              <p style="color:#6b7280;line-height:1.6;">
                Your lost item report for a <strong>${report.itemCategory}</strong> at 
                <strong>${locationAddress}</strong> has been 
                <span style="color:${isApproved ? "#16a34a" : "#dc2626"};font-weight:bold;">${status}</span>.
              </p>
              <div style="background:${isApproved ? "#dcfce7" : "#fee2e2"};border-left:4px solid ${isApproved ? "#22c55e" : "#ef4444"};padding:15px;border-radius:4px;margin:20px 0;">
                <p style="margin:0;color:${isApproved ? "#166534" : "#991b1b"};">
                  ${
                    isApproved
                      ? "We'll review the information and reach out if we have a match. Thank you for using ReClaim!"
                      : "This may be due to insufficient information. You're welcome to submit a new report with clearer details."
                  }
                </p>
              </div>
              <p style="color:#9ca3af;font-size:13px;margin-top:30px;">— The ReClaim Team</p>
            </div>
          </div>
        `;

        sendEmail(user.email, subject, html).catch((err) =>
          console.error("Failed to send status email:", err.message),
        );
      }

      return res
        .status(200)
        .json({
          success: true,
          message: `Report ${status} successfully`,
          data: report,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to update report",
        });
    }
  }

  async deleteReport(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "Report ID is required" });
      const report = await LostItemModel.findById(id);
      if (!report)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      const reportedById =
        (report.reportedBy as any)?._id?.toString() ||
        report.reportedBy?.toString();
      if (req.user.role !== "admin" && reportedById !== userId.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Not authorized to delete this report",
          });
      }
      if (report.imageUrl) {
        const filename = report.imageUrl.split("/").pop();
        if (filename) {
          const imagePath = path.join(
            process.cwd(),
            "public",
            "lost_reports",
            filename,
          );
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }
      await LostItemModel.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ success: true, message: "Report deleted successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to delete report",
        });
    }
  }

  async getReportsByCategory(req: AuthRequest, res: Response) {
    try {
      const { category } = req.params;
      if (!category)
        return res
          .status(400)
          .json({ success: false, message: "Category is required" });
      const reports = await LostItemModel.find({
        itemCategory: { $regex: new RegExp(category, "i") },
      })
        .populate("reportedBy", "fullName email")
        .sort({ createdAt: -1 });
      return res
        .status(200)
        .json({
          success: true,
          message: `Reports for category: ${category}`,
          count: reports.length,
          data: reports,
        });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to fetch reports by category",
        });
    }
  }
}
