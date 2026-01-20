import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { resetDatabase } from "../../utils/db";
import { AuthService } from "../../../src/services/authService";
import type { User, RefreshToken } from "../../../src/model";
import type { UserRepository } from "../../../src/repository/contracts/userRepository";
import type { RefreshTokenRepository } from "../../../src/repository/contracts/refreshTokenRepository";

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.users.find((u) => u.google_id === googleId) ?? null;
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(input: {
    email: string;
    password: string;
    name: string;
    status?: boolean;
    googleId?: string | null;
    createdBy: number;
    updatedBy: number;
  }): Promise<User> {
    const nextId = this.users.length
      ? Math.max(...this.users.map((u) => u.id)) + 1
      : 1;
    const user: User = {
      id: nextId,
      email: input.email,
      password: input.password,
      name: input.name,
      status: typeof input.status === "boolean" ? input.status : true,
      google_id: input.googleId ?? null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: input.createdBy,
      updated_by: input.updatedBy,
    };
    this.users.push(user);
    return user;
  }

  async updateUser(
    id: number,
    input: {
      name?: string;
      status?: boolean;
      googleId?: string | null;
      password?: string;
      updatedBy: number;
    },
  ): Promise<User> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("USER_NOT_FOUND");
    }
    const updated: User = {
      ...existing,
      name: typeof input.name === "string" ? input.name : existing.name,
      status:
        typeof input.status === "boolean" ? input.status : existing.status,
      google_id:
        typeof input.googleId !== "undefined"
          ? input.googleId
          : existing.google_id,
      password:
        typeof input.password === "string"
          ? input.password
          : existing.password,
      updated_by: input.updatedBy,
      updated_at: new Date(),
    };
    this.users = this.users.map((u) => (u.id === id ? updated : u));
    return updated;
  }

  async deleteUser(id: number): Promise<number> {
    const before = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return before - this.users.length;
  }
}

class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private tokens: RefreshToken[] = [];
  private nextId = 1;

  async create(userId: number, token: string): Promise<RefreshToken> {
    const refreshToken: RefreshToken = {
      id: this.nextId++,
      token,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 0,
      updated_by: 0,
    };
    this.tokens.push(refreshToken);
    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.tokens.find((t) => t.token === token) ?? null;
  }

  async deleteById(id: number): Promise<void> {
    this.tokens = this.tokens.filter((t) => t.id !== id);
  }

  async deleteAllForUser(userId: number): Promise<void> {
    this.tokens = this.tokens.filter((t) => t.user_id !== userId);
  }

  getByUserId(userId: number): RefreshToken[] {
    return this.tokens.filter((t) => t.user_id === userId);
  }
}

describe("POST /auth/refresh-token", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("mengembalikan 401 jika token tidak ada", async () => {
    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Refresh token tidak ditemukan");
  });

  it("mengembalikan 401 jika token invalid", async () => {
    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json")
      .set("Cookie", [`refresh_token=invalid-token`]);

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Refresh token tidak valid");
  });

  it("refresh token hanya menghapus sesi yang digunakan dan mempertahankan sesi lain", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const authService = new AuthService(userRepository, refreshTokenRepository);
    const user = await userRepository.createUser({
      email: `multilogin-${Date.now()}@example.com`,
      password: "dummy-password",
      name: "Multi Login User",
      status: true,
      googleId: null,
      createdBy: 0,
      updatedBy: 0,
    });

    const firstLogin = await authService.loginWithUser(user);
    const secondLogin = await authService.loginWithUser(user);
    const firstRefreshToken = firstLogin.tokens.refreshToken;
    const secondRefreshToken = secondLogin.tokens.refreshToken;

    const tokensBeforeRefresh = refreshTokenRepository.getByUserId(user.id);

    expect(tokensBeforeRefresh.some((t) => t.token === firstRefreshToken)).toBe(
      true,
    );
    expect(
      tokensBeforeRefresh.some((t) => t.token === secondRefreshToken),
    ).toBe(true);

    await authService.refreshAccessTokenFromRefreshToken(firstRefreshToken);

    await expect(
      authService.refreshAccessTokenFromRefreshToken(firstRefreshToken),
    ).rejects.toThrow("REFRESH_TOKEN_INVALID");

    const tokensInDb = refreshTokenRepository.getByUserId(user.id);

    expect(tokensInDb.some((t) => t.token === firstRefreshToken)).toBe(false);
    expect(tokensInDb.some((t) => t.token === secondRefreshToken)).toBe(true);

    const newTokens =
      await authService.refreshAccessTokenFromRefreshToken(secondRefreshToken);

    expect(typeof newTokens.accessToken).toBe("string");
    expect(typeof newTokens.refreshToken).toBe("string");
  });
});
