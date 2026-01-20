import { getPrisma } from "../config";
import type { RefreshToken } from "../model";
import type { RefreshTokenRepository } from "./contracts/refreshTokenRepository";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  private readonly prisma = getPrisma();

  create(userId: number, token: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        user_id: userId,
        token,
      },
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return result;
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { id },
    });
  }

  async deleteAllForUser(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    });
  }
}
