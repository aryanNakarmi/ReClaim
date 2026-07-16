import { LostItemModel, ILostItem } from "../models/lostitem.model";
import { LostItemType } from "../types/lostitem.type";

export interface ILostItemRepository {
  createReport(reportData: Partial<LostItemType & { reportedBy: string }>): Promise<ILostItem>;
  getReportById(id: string): Promise<ILostItem | null>;
  getAllReports(): Promise<ILostItem[]>;
  getReportsByCategory(category: string): Promise<ILostItem[]>;
  getMyReports(userId: string): Promise<ILostItem[]>;
  updateReportStatus(id: string, status: "pending" | "approved" | "rejected", rejectionReason?: string): Promise<ILostItem | null>;
  deleteReport(id: string): Promise<boolean>;
}

export class LostItemRepository implements ILostItemRepository {
  async createReport(reportData: Partial<LostItemType & { reportedBy: string }>): Promise<ILostItem> {
    const report = new LostItemModel(reportData);
    return await report.save();
  }

  async getReportById(id: string): Promise<ILostItem | null> {
    return await LostItemModel.findById(id).populate("reportedBy", "fullName email");
  }

  async getAllReports(): Promise<ILostItem[]> {
    return await LostItemModel.find().populate("reportedBy", "fullName email").sort({ createdAt: -1 });
  }

  async getReportsByCategory(category: string): Promise<ILostItem[]> {
    return await LostItemModel.find({ itemCategory: { $regex: category, $options: "i" } })
      .populate("reportedBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  async getMyReports(userId: string): Promise<ILostItem[]> {
    return await LostItemModel.find({ reportedBy: userId })
      .populate("reportedBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  async updateReportStatus(id: string, status: "pending" | "approved" | "rejected", rejectionReason?: string): Promise<ILostItem | null> {
    const report = await LostItemModel.findById(id);
    if (!report) return null;

    report.status = status;
    if (status === "rejected" && rejectionReason) {
      report.description = `${report.description || ""}\nRejection reason: ${rejectionReason}`;
    }
    await report.save();
    return report;
  }

  async deleteReport(id: string): Promise<boolean> {
    const result = await LostItemModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
