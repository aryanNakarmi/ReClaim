    import { UserService } from "../services/user.service";
    import { Request, Response } from "express";
    import { ActivityModel } from '../models/activity.model';
    import { IPBlocklistModel } from '../models/ipblocklist.model';

    let userService = new UserService();
 
    export class AdminController {
        async createUser(req: Request, res: Response) {
            try {
                const { fullName, email, phoneNumber, password } = req.body;
                const profilePicture = req.file ? `/profile_pictures/${req.file.filename}` : null;

                const newUser = await userService.createUser({
                    fullName,
                    email,
                    phoneNumber,
                    password,
                    profilePicture,
                });

                return res.status(201).json({
                    success: true,
                    message: "User created successfully",
                    data: {
                        _id: newUser._id,
                        fullName: newUser.fullName,
                        email: newUser.email,
                        phoneNumber: newUser.phoneNumber || null,
                        profilePicture: newUser.profilePicture || null,
                        role: newUser.role,
                    }
                });
            } catch (error: Error | any) {
                return res.status(error.statusCode ?? 500).json(
                    { success: false, message: error.message || "Failed to create user" }
                );
            }
        }

    async getAllUsers(req: Request, res: Response) {
        try {
            const { page, size, search } = req.query;
            
            const { users, pagination } = await userService.getAllUsers({
                page: page as string | undefined,
                size: size as string | undefined,
                search: search as string | undefined
            });
            
            return res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: users.map(user => ({
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber || null,
                    profilePicture: user.profilePicture || null,
                    role: user.role,
                    createdAt: user.createdAt,
                })),
                pagination: pagination
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch users"
            });
        }
    }

        async getUserById(req: Request, res: Response) {
            try {
                const { id } = req.params;
                
                if (!id) {
                    return res.status(400).json({ success: false, message: "User ID is required" });
                }

                const user = await userService.getUserById(id);
                
                if (!user) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }

                return res.status(200).json({
                    success: true,
                    message: "User retrieved successfully",
                    data: {
                        _id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phoneNumber: user.phoneNumber || null,
                        profilePicture: user.profilePicture || null,
                        role: user.role,
                        createdAt: user.createdAt,
                    }
                });
            } catch (error: Error | any) {
                return res.status(error.statusCode ?? 500).json(
                    { success: false, message: error.message || "Failed to fetch user" }
                );
            }
        }

        async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { fullName, email, phoneNumber, role } = req.body;

            const updateData: any = {};
            
            // Only include fields that are provided
            if (fullName) updateData.fullName = fullName;
            if (email) updateData.email = email;
            if (phoneNumber) updateData.phoneNumber = phoneNumber;
            
            // Validate and add role
            if (role && ["user", "admin"].includes(role)) {
                updateData.role = role; 
            }
            
            if (req.file) {
                updateData.profilePicture = `/profile_pictures/${req.file.filename}`;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "No fields to update" 
                });
            }

            const user = await userService.updateUser(id, updateData); 
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber || null,
                    profilePicture: user.profilePicture || null,
                    role: user.role,
                }
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Failed to update user" }
            );
        }
}
        async deleteUser(req: Request, res: Response) {
            try {
                const { id } = req.params;
                
                if (!id) {
                    return res.status(400).json({ success: false, message: "User ID is required" });
                }

                const user = await userService.getUserById(id);
                if (!user) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }

                await userService.deleteUser(id);

                return res.status(200).json({
                    success: true,
                    message: "User deleted successfully",
                    data: { _id: id }
                });
            } catch (error: Error | any) {
                return res.status(error.statusCode ?? 500).json(
                    { success: false, message: error.message || "Failed to delete user" }
                );
            }
        }

    // ── IP Blocking ──
    async blockIP(req: Request, res: Response) {
        try {
            const { ip, reason } = req.body;
            if (!ip) {
                return res.status(400).json({ success: false, message: 'IP address is required' });
            }

            const existing = await IPBlocklistModel.findOne({ ip });
            if (existing) {
                return res.status(409).json({ success: false, message: 'This IP is already blocked' });
            }

            await IPBlocklistModel.create({
                ip,
                reason: reason || 'Blocked by admin',
                blockedBy: (req as any).user._id,
            });

            return res.status(201).json({
                success: true,
                message: `IP ${ip} blocked successfully`,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to block IP',
            });
        }
    }

    async unblockIP(req: Request, res: Response) {
        try {
            const { ip } = req.params;
            if (!ip) {
                return res.status(400).json({ success: false, message: 'IP address is required' });
            }

            const result = await IPBlocklistModel.deleteOne({ ip });
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: 'IP not found in blocklist' });
            }

            return res.status(200).json({
                success: true,
                message: `IP ${ip} unblocked successfully`,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to unblock IP',
            });
        }
    }

    async getBlockedIPs(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const [ips, total] = await Promise.all([
                IPBlocklistModel.find()
                    .sort({ blockedAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('blockedBy', 'fullName email')
                    .lean(),
                IPBlocklistModel.countDocuments(),
            ]);

            return res.status(200).json({
                success: true,
                data: ips,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch blocked IPs',
            });
        }
    }

    // ── Activity / Monitoring ──
    async getActivities(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const action = req.query.action as string;
            const success = req.query.success as string;

            const filter: any = {};
            if (action) filter.action = action;
            if (success === 'true' || success === 'false') filter.success = success === 'true';

            const [activities, total] = await Promise.all([
                ActivityModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('userId', 'fullName email')
                    .lean(),
                ActivityModel.countDocuments(filter),
            ]);

            // Map activities to include user name/email alongside the raw data
            const data = activities.map((a: any) => ({
                _id: a._id,
                action: a.action,
                resource: a.resource,
                resourceId: a.resourceId,
                details: a.details,
                success: a.success,
                severity: a.success ? 'info' : 'critical',
                userRole: a.userRole,
                userName: a.userId?.fullName || undefined,
                userEmail: a.userId?.email || undefined,
                ip: a.ip,
                createdAt: a.createdAt,
            }));

            return res.status(200).json({
                success: true,
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch activities',
            });
        }
    }
    }