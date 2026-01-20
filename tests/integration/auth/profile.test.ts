import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { hashPassword } from "../../../src/helper/password";
import { resetDatabase } from "../../utils/db";
import { PrismaUserRepository } from "../../../src/repository/userRepository";
import { PrismaRefreshTokenRepository } from "../../../src/repository/refreshTokenRepository";
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
}

describe("GET /auth/profile", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  const createTestUser = async (
    email = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`,
    active = true,
  ) => {
    const prisma = getPrisma();
    const passwordHash = await hashPassword("password123");
    return prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: "Test User",
        status: active,
        created_by: 0,
        updated_by: 0,
      },
    });
  };

  it("mengambil profile user dari access_token yang valid", async () => {
    const userRepository = new InMemoryUserRepository();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const authService = new AuthService(userRepository, refreshTokenRepository);

    const user = await userRepository.createUser({
      email: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`,
      password: "dummy-password",
      name: "Test User",
      status: true,
      googleId: null,
      createdBy: 0,
      updatedBy: 0,
    });

    const loginResult = await authService.loginWithUser(user);
    const token = loginResult.tokens.accessToken;

    const profileUser = await authService.getUserFromAccessToken(token);

    expect(profileUser).toMatchObject({
      email: user.email,
      name: user.name,
      status: true,
    });
  });

  it("mengembalikan 401 jika cookie access_token tidak ada", async () => {
    const response = await request(app)
      .get("/auth/profile")
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("mengembalikan 401 jika token tidak valid (signature salah)", async () => {
    const token = jwt.sign({ sub: 1 }, "wrong_secret");
    const response = await request(app)
      .get("/auth/profile")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak valid");
  });

  it("mengembalikan 401 jika token malformed", async () => {
    const response = await request(app)
      .get("/auth/profile")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=malformed_token`]);

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak valid");
  });

  it("mengembalikan 401 jika user tidak ditemukan di database", async () => {
    const prisma = getPrisma();
    const user = await createTestUser();
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      "change_me_jwt_secret",
    );
    await prisma.user.deleteMany({ where: { id: user.id } });

    const response = await request(app)
      .get("/auth/profile")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Pengguna tidak ditemukan");
  });

  it("mengembalikan 403 jika user tidak aktif", async () => {
    const user = await createTestUser("inactive@example.com", false);
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      "change_me_jwt_secret",
    );

    const response = await request(app)
      .get("/auth/profile")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(403);
    expect(response.body.errors).toContain("Akun tidak aktif");
  });
});
