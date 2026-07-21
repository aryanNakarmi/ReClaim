import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { LostItemModel } from '../models/lostitem.model';
import { FoundItemModel } from '../models/founditem.model';

/**
 * Data Controller
 * 
 * Provides data export and import functionality for users to download
 * and restore their personal data — supporting privacy principles
 * and right-to-data-portability.
 * 
 * Requirements alignment:
 * - Data export and import features aligned with privacy principles (Section 2)
 */

const userRepository = new UserRepository();

export class DataController {
  /**
   * Export all user data (profile, lost reports, claims).
   * Returns a JSON file with all user-related data.
   */
  async exportUserData(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id.toString();

      // Gather all user data
      const user = await userRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const lostReports = await LostItemModel.find({ reportedBy: userId }).lean();
      const claims = await FoundItemModel.find({
        'claimRequests.userId': userId,
      }).lean();

      // Build export payload (exclude sensitive fields)
      const exportData = {
        exportedAt: new Date().toISOString(),
        profile: {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        lostReports: lostReports.map((r) => ({
          itemCategory: r.itemCategory,
          location: r.location,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt,
        })),
        claims: claims.map((c) => ({
          id: c._id,
          item: c.brandColor,
          category: c.itemCategory,
          status: c.status,
          location: c.location,
        })),
      };

      return res.status(200).json({
        success: true,
        message: 'Data exported successfully',
        data: exportData,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to export data',
      });
    }
  }

  /**
   * Import user data from a previously exported JSON file.
   * Restores profile info and lost reports.
   */
  async importUserData(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id.toString();
      const { profile, lostReports } = req.body;

      if (!profile && !lostReports) {
        return res.status(400).json({
          success: false,
          message: 'No importable data found. Expected "profile" and/or "lostReports" fields.',
        });
      }

      const results: string[] = [];

      // ── Import profile data (updatable fields only) ──
      if (profile) {
        const updateData: any = {};
        if (profile.fullName) updateData.fullName = profile.fullName;
        if (profile.phoneNumber) updateData.phoneNumber = profile.phoneNumber;

        if (Object.keys(updateData).length > 0) {
          await userRepository.updateUser(userId, updateData);
          results.push('Profile updated successfully');
        }
      }

      // ── Import lost reports ──
      if (lostReports && Array.isArray(lostReports) && lostReports.length > 0) {
        const reportsToCreate = lostReports.map((r: any) => ({
          itemCategory: r.itemCategory,
          location: r.location,
          description: r.description || '',
          imageUrl: '',
          status: 'pending',
          reportedBy: userId,
        }));

        const created = await LostItemModel.insertMany(reportsToCreate);
        results.push(`${created.length} lost report(s) imported successfully`);
      }

      return res.status(200).json({
        success: true,
        message: results.length > 0 ? results.join('. ') : 'No data was imported',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to import data',
      });
    }
  }
}

export const dataController = new DataController();
