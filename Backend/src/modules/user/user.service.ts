import bcrypt from "bcryptjs";
import AppError from "../../utils/AppError";
import UserRepository from "./user.repository";

export class UserService {
  static async create(data: {
    fullName: string;
    email: string;
    password?: string;
    role?: "ADMIN" | "RECEPTIONIST";
    isActive?: boolean;
  }) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(400, "A user with this email already exists");
    }

    const rawPassword = data.password || "Reception@12345";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    return UserRepository.create({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role || "RECEPTIONIST",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  static async getAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const searchTerm = query.search || query.searchTerm || query.q;
    const role = query.role;
    const isActive =
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === true
        : undefined;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    return UserRepository.findAll({
      page,
      limit,
      searchTerm,
      role,
      isActive,
      sortBy,
      sortOrder,
    });
  }

  static async getById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  static async update(id: string, data: any) {
    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName.trim();
    if (data.email) {
      const normalizedEmail = data.email.trim().toLowerCase();
      if (normalizedEmail !== existing.email) {
        const emailTaken = await UserRepository.findByEmail(normalizedEmail);
        if (emailTaken) {
          throw new AppError(400, "Email is already in use by another account");
        }
        updateData.email = normalizedEmail;
      }
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return UserRepository.update(id, updateData);
  }

  static async activate(id: string) {
    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }
    return UserRepository.update(id, { isActive: true });
  }

  static async deactivate(id: string) {
    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }
    return UserRepository.update(id, { isActive: false });
  }

  static async delete(id: string, currentUserId?: string) {
    if (currentUserId && id === currentUserId) {
      throw new AppError(400, "You cannot delete your own account");
    }

    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }

    return UserRepository.delete(id);
  }
}
