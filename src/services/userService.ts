import type { User } from "../model";
import type { UserRepository } from "../repository/contracts/userRepository";
import { hashSystemPassword } from "../helper/password";
import {
  isUserAlreadyExistsPrismaError,
  isUserNotFoundPrismaError,
  validateUserDeleted,
  validateUserEmailAvailable,
  validateUserExists,
} from "../validation/userDomainValidation";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async listUsers(params?: {
    page?: number;
    pageSize?: number;
    search?: string | undefined;
    orderField?: "email" | "name" | "status" | "created_at" | "updated_at";
    orderDir?: "asc" | "desc";
  }): Promise<User[]> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    return this.userRepository.findAll({
      skip,
      take: pageSize,
      ...(typeof params?.search === "string" ? { search: params.search } : {}),
      ...(typeof params?.orderField === "string"
        ? { orderField: params.orderField }
        : {}),
      ...(typeof params?.orderDir === "string" ? { orderDir: params.orderDir } : {}),
    });
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    return validateUserExists(user);
  }

  async createUser(input: {
    email: string;
    name: string;
    status?: boolean | undefined;
  }): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    validateUserEmailAvailable(existing);

    const passwordHash = await hashSystemPassword();

    const createInput = {
      email: input.email,
      password: passwordHash,
      name: input.name,
      createdBy: 0,
      updatedBy: 0,
    } as const;

    const withStatus =
      typeof input.status === "boolean"
        ? { ...createInput, status: input.status }
        : createInput;

    try {
      return await this.userRepository.createUser(withStatus);
    } catch (error) {
      if (isUserAlreadyExistsPrismaError(error)) {
        throw new Error("USER_ALREADY_EXISTS");
      }
      throw error;
    }
  }

  async updateUser(id: number, input: { name: string }) {
    const baseUpdate = {
      updatedBy: 0,
    } as const;

    try {
      return await this.userRepository.updateUser(id, {
        ...baseUpdate,
        name: input.name,
      });
    } catch (error) {
      if (isUserNotFoundPrismaError(error)) {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }
  }

  async updateUserStatus(id: number, status: boolean) {
    try {
      return await this.userRepository.updateUser(id, {
        status,
        updatedBy: 0,
      });
    } catch (error) {
      if (isUserNotFoundPrismaError(error)) {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    const deletedCount = await this.userRepository.deleteUser(id);
    validateUserDeleted(deletedCount);
  }
}
