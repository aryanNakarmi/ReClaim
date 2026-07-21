import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
import { captchaService } from "../services/captcha.service";
import { logSuccess, logFailure } from "../middleware/activity.middleware";

let userService = new UserService();
 
export class AuthController {
    async register(req: Request, res: Response) {
        try {
            // ── CAPTCHA verification ──
            const captchaToken = req.body.captchaToken;
            const captchaValid = await captchaService.verifyToken(captchaToken);
            if (!captchaValid) {
                return res.status(400).json({ success: false, message: "CAPTCHA verification failed" });
            }

            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);

            // ── Activity log ──
            await logSuccess(req, 'REGISTER', 'User', newUser._id.toString(), 'User registered successfully');

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber || null,
                    profilePicture: newUser.profilePicture || null,
                    role: newUser.role,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt 
                }
            });
        } catch (error: Error | any) {
            await logFailure(req, 'REGISTER', 'User', error.message);
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Registration Failed" }
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            // ── CAPTCHA verification ──
            const captchaToken = req.body.captchaToken;
            const captchaValid = await captchaService.verifyToken(captchaToken);
            if (!captchaValid) {
                return res.status(400).json({ success: false, message: "CAPTCHA verification failed" });
            }

            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user, requiresMFA, tempToken } = await userService.loginUser(loginData);

            // Set req.user so the activity logger can capture the user's name/email
            (req as any).user = { _id: user._id, fullName: user.fullName, email: user.email, role: user.role };

            // ── Activity log ──
            await logSuccess(req, 'LOGIN', 'User', user._id.toString(), 'User logged in');

            // If MFA is required, return temp token and don't issue full JWT yet
            if (requiresMFA) {
                return res.status(200).json({
                    success: true,
                    message: "MFA verification required",
                    requiresMFA: true,
                    tempToken,
                    userId: user._id.toString(),
                });
            }

            return res.status(200).json({
                success: true, message: "Login successful",
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    profilePicture: user.profilePicture,
                    role: user.role,
                    createdAt: user.createdAt,    
                    updatedAt: user.updatedAt 
                },
                token
            });
        } catch (error: Error | any) {
            await logFailure(req, 'LOGIN', 'User', error.message);
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }



    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json(
                    { success: false, message: "User ID is required" }
                );
            }

            const user = await userService.getUserById(id);
            
            if (!user) {
                return res.status(404).json(
                    { success: false, message: "User not found" }
                );
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
                    updatedAt: user.updatedAt
                }
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Failed to fetch user" }
            );
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json(
                    { success: false, message: "User ID is required" }
                );
            }

            const user = await userService.getUserById(id);
            
            if (!user) {
                return res.status(404).json(
                    { success: false, message: "User not found" }
                );
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

     async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User Id Not found" });
      }
      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) }); // z.prettifyError - better error messages (zod)
      }
      if (req.file) {
        parsedData.data.profilePicture = `/profile_pictures/${req.file.filename}`;
      }
      const updatedUser = await userService.updateUser(userId, parsedData.data);
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User profile updated successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
}

    async requestPasswordReset(req: Request, res: Response) {
        try {
            const email = req.body.email;
            if (!email) {
                return res.status(400).json(
                    { success: false, message: "Email is required" }
                );
            }
            const user = await userService.sendResetPasswordEmail(email);
            await logSuccess(req, 'PASSWORD_RESET_REQUEST', 'User', user._id.toString(), 'Password reset email sent');
            return res.status(200).json(
                { success: true,
                    data: user,
                    message: "Password reset email sent" }
            );
        }catch (error: Error | any) {
            await logFailure(req, 'PASSWORD_RESET_REQUEST', 'User', error.message);
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
           const token = req.params.token;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            await logSuccess(req, 'PASSWORD_RESET', 'User', undefined, 'Password reset completed');
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            await logFailure(req, 'PASSWORD_RESET', 'User', error.message);
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
