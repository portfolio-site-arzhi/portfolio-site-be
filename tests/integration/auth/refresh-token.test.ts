import request from "supertest";
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
    const prisma = getPrisma();
    const passwordHash = await hashPassword("password123");
    const user = await prisma.user.create({
      data: {
        email: `multilogin-${Date.now()}@example.com`,
        password: passwordHash,
        name: "Multi Login User",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const firstRefreshToken = `refresh-1-${Date.now()}`;
    const secondRefreshToken = `refresh-2-${Date.now()}`;

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: firstRefreshToken,
        created_by: 0,
        updated_by: 0,
      },
    });

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: secondRefreshToken,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .post("/auth/refresh-token")
      .set("Accept", "application/json")
      .set("Cookie", [`refresh_token=${firstRefreshToken}`]);

    expect(response.status).toBe(200);
    expect(typeof response.body.access_token).toBe("string");

    const tokens = await prisma.refreshToken.findMany({
      where: { user_id: user.id },
    });

    const values = tokens.map((t) => t.token);

    expect(values).not.toContain(firstRefreshToken);
    expect(values).toContain(secondRefreshToken);
    expect(tokens.length).toBe(2);
  });
});
