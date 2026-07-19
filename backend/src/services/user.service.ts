import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../models/user.model";
import { sendEmail } from "../config/email";

const CLIENT_URL = process.env.CLIENT_URL as string;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const PASSWORD_HISTORY_LIMIT = 5; // Prevent reuse of last 5 passwords

let userRepository = new UserRepository(); 

export class UserService {
 async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
        throw new HttpError(409, "Email already in use");
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const userData: Partial<IUser> = {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        phoneNumber: data.phoneNumber ?? undefined,
        profilePicture: data.profilePicture ?? undefined,
        role: data.role ?? "user",
        loginAttempts: 0,
        lockUntil: undefined,
        mfaEnabled: false,
        passwordHistory: [hashedPassword],
        passwordChangedAt: new Date(),
    };

    const newUser = await userRepository.createUser(userData);
    return newUser;
}

  /**
   * Login with account lockout protection.
   * Tracks failed attempts and locks account after MAX_LOGIN_ATTEMPTS.
   */
  async loginUser(data: LoginUserDTO): Promise<{ token?: string; user: IUser; requiresMFA?: boolean; tempToken?: string }> {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    // ── Check if account is locked ──
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      throw new HttpError(
        423,
        `Account locked. Try again in ${remainingMinutes} minute(s).`
      );
    }

    // ── Compare password ──
    const validPassword = await bcryptjs.compare(data.password, user.password);

    if (!validPassword) {
      // Increment failed attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const updateData: any = { loginAttempts: attempts };

      // Lock account if exceeded max attempts
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockUntil = new Date(
          Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
        );
        await userRepository.updateUser(user._id.toString(), updateData);
        throw new HttpError(
          423,
          `Account locked for ${LOCK_DURATION_MINUTES} minutes due to too many failed attempts.`
        );
      }

      await userRepository.updateUser(user._id.toString(), updateData);
      throw new HttpError(401, 'Invalid credentials');
    }

    // ── Successful login — reset attempts ──
    if (user.loginAttempts && user.loginAttempts > 0) {
      await userRepository.updateUser(user._id.toString(), {
        loginAttempts: 0,
        lockUntil: undefined,
      });
    }

    // ── Check MFA ──
    if (user.mfaEnabled) {
      // Issue a short-lived temporary token for MFA verification
      const tempPayload = {
        id: user._id,
        email: user.email,
        purpose: 'mfa' as const,
      };
      const tempToken = jwt.sign(tempPayload, JWT_SECRET, { expiresIn: '5m' });
      return { user, requiresMFA: true, tempToken };
    }

    // generate jwt
    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    return { token, user };
  }

    async getAllUsers({ page, size, search }: { page?: string | undefined, size?: string | undefined, search?: string | undefined }) {
        const currentPage = page ? parseInt(page) : 1;
        const currentSize = size ? parseInt(size) : 10;
        const currentSearch = search || "";
        
        const { users, totalUsers } = await userRepository.getAllUsers({ 
            page: currentPage, 
            size: currentSize, 
            search: currentSearch 
        });
        
        const pagination = {
            page: currentPage,
            size: currentSize,
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / currentSize),
        }
        
        return { users, pagination };
    }
    async getUserById(id: string) {
        try {
            if (!id) {
                throw new HttpError(400, "User ID is required");
            }
            const user = await userRepository.getUserById(id);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            return user;
        } catch (error: Error | any) {
            throw new HttpError(error.statusCode ?? 500, error.message || "Failed to fetch user");
        }
    }

    async deleteUser(id: string) {
        try {
            if (!id) {
                throw new HttpError(400, "User ID is required");
            }
            const user = await userRepository.getUserById(id);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const deletedUser = await userRepository.deleteUser(id);
            return deletedUser;
        } catch (error: Error | any) {
            throw new HttpError(error.statusCode ?? 500, error.message || "Failed to delete user");
        }
    }

async updateUser(id: string, data: Partial<CreateUserDTO>) {
    try {
        if (!id) throw new HttpError(400, "User ID is required");

        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpError(404, "User not found");

        // Check email uniqueness
        if (data.email && data.email !== user.email) {
            const emailCheck = await userRepository.getUserByEmail(data.email);
            if (emailCheck) throw new HttpError(409, "Email already in use");
        }

        // Map DTO to IUser-compatible object
        const updateData: Partial<IUser> = {
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber ?? undefined,
            profilePicture: data.profilePicture ?? undefined,
            role: data.role ?? user.role
        };

        // Hash password if provided with reuse protection
        if (data.password) {
            // ── Password reuse prevention ──
            const history = user.passwordHistory || [];
            for (const oldHash of history) {
                const isReused = await bcryptjs.compare(data.password, oldHash);
                if (isReused) {
                    throw new HttpError(400, "You cannot reuse a recent password. Please choose a different password.");
                }
            }

            const hashedPassword = await bcryptjs.hash(data.password, 10);
            updateData.password = hashedPassword;

            // Update password history (keep last 5)
            const updatedHistory = [...history, hashedPassword].slice(-PASSWORD_HISTORY_LIMIT);
            (updateData as any).passwordHistory = updatedHistory;
            (updateData as any).passwordChangedAt = new Date();
        }

        const updatedUser = await userRepository.updateUser(id, updateData);
        return updatedUser;
    } catch (error: any) {
        throw new HttpError(error.statusCode ?? 500, error.message || "Failed to update user");
    }
    }
    async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            
            const hashedPassword = await bcryptjs.hash(newPassword, 10);

            // ── Password reuse prevention ──
            const history = user.passwordHistory || [];
            for (const oldHash of history) {
                const isReused = await bcryptjs.compare(newPassword, oldHash);
                if (isReused) {
                    throw new HttpError(400, "You cannot reuse a recent password. Please choose a different password.");
                }
            }

            // Update password history (keep last 5)
            const updatedHistory = [...history, hashedPassword].slice(-PASSWORD_HISTORY_LIMIT);

            await userRepository.updateUser(userId, { 
                password: hashedPassword,
                passwordHistory: updatedHistory,
                passwordChangedAt: new Date(),
            });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }
}