import { getPrisma } from "../config";
import type { CreateUserInput, UpdateUserInput, User } from "../model";
import type { UserRepository } from "./contracts/userRepository";

export class PrismaUserRepository implements UserRepository {
  private readonly prisma = getPrisma();

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { google_id: googleId } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(input: CreateUserInput): Promise<User> {
    const { email, password, name, status, googleId, createdBy, updatedBy } =
      input;

    return this.prisma.user.create({
      data: {
        email,
        password,
        name,
        status: typeof status === "boolean" ? status : true,
        google_id: googleId ?? null,
        created_by: createdBy,
        updated_by: updatedBy,
      },
    });
  }

  updateUser(id: number, input: UpdateUserInput): Promise<User> {
    const { name, status, googleId, password, updatedBy } = input;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(typeof name === "string" ? { name } : {}),
        ...(typeof status === "boolean" ? { status } : {}),
        ...(typeof googleId !== "undefined" ? { google_id: googleId } : {}),
        ...(typeof password === "string" ? { password } : {}),
        updated_by: updatedBy,
      },
    });
  }
}
