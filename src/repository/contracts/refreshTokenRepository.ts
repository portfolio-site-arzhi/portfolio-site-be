import type { RefreshToken } from "../../model";

export interface RefreshTokenRepository {
  create(userId: number, token: string): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteById(id: number): Promise<void>;
  deleteAllForUser(userId: number): Promise<void>;
}

