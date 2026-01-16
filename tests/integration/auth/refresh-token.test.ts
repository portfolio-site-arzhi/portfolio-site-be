import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { hashPassword } from "../../../src/helper/password";
import { resetDatabase } from "../../utils/db";

describe("POST /auth/refresh-token", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  const getSecret = () => {
    const secretFromEnv = process.env.COOKIE_SECRET;
    return secretFromEnv && secretFromEnv.length >= 16
      ? secretFromEnv
      : "change_me_jwt_secret";
  };

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

  const generateToken = (user: {
    id: number;
    email: string;
    name: string;
    status: boolean;
  }) => {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
      getSecret(),
    );
  };

  it("refresh token mengembalikan access_token baru dan set cookie", async () => {
    const user = await createTestUser("refresh@example.com");
    const token = generateToken(user);

    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(200);
    expect(typeof response.body.access_token).toBe("string");
    const refreshCookies = response.headers["set-cookie"];
    expect(Array.isArray(refreshCookies)).toBe(true);
  });

  it("mengembalikan 401 jika token tidak ada", async () => {
    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("mengembalikan 401 jika token invalid", async () => {
    const token = jwt.sign({ sub: 1 }, "wrong_secret");
    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak valid");
  });

  it("mengembalikan 401 jika user tidak ditemukan", async () => {
    const user = await createTestUser();
    const token = generateToken(user);
    const prisma = getPrisma();
    await prisma.user.deleteMany({ where: { id: user.id } });

    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Pengguna tidak ditemukan");
  });

  it("mengembalikan 403 jika user tidak aktif", async () => {
    const user = await createTestUser("inactive_refresh@example.com", false);
    const token = generateToken(user);

    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json")
      .set("Cookie", [`access_token=${token}`]);

    expect(response.status).toBe(403);
    expect(response.body.errors).toContain("Akun tidak aktif");
  });
});
