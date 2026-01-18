import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";
import { getPrisma } from "../../../src/config";
import { hashPassword } from "../../../src/helper/password";

describe("POST /auth/logout", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("logout menghapus cookie access_token", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", ["access_token=dummy_token"])
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logout berhasil");

    const cookies = response.headers["set-cookie"] as unknown as string[] | undefined;
    expect(Array.isArray(cookies)).toBe(true);
    const accessTokenCookie = cookies?.find((c: string) =>
      c.startsWith("access_token="),
    );
    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie).toMatch(
      /Expires=Thu, 01 Jan 1970 00:00:00 GMT/,
    );
  });

  it("logout tetap sukses meski tanpa token (idempotent)", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logout berhasil");

    const cookies = response.headers["set-cookie"] as unknown as string[] | undefined;
    expect(Array.isArray(cookies)).toBe(true);
    const accessTokenCookie = cookies?.find((c: string) =>
      c.startsWith("access_token="),
    );
    expect(accessTokenCookie).toBeDefined();
  });

  it("logout hanya menghapus refresh token untuk sesi saat ini", async () => {
    const prisma = getPrisma();
    const passwordHash = await hashPassword("password123");

    const user = await prisma.user.create({
      data: {
        email: `logout-multilogin-${Date.now()}@example.com`,
        password: passwordHash,
        name: "Logout Multi Login User",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const firstRefresh = await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: `logout-refresh-1-${Date.now()}`,
        created_by: 0,
        updated_by: 0,
      },
    });

    const secondRefresh = await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: `logout-refresh-2-${Date.now()}`,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .post("/auth/logout")
      .set("Accept", "application/json")
      .set("Cookie", [`refresh_token=${firstRefresh.token}`]);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logout berhasil");

    const tokens = await prisma.refreshToken.findMany({
      where: { user_id: user.id },
    });

    const ids = tokens.map((t) => t.id);

    expect(ids).not.toContain(firstRefresh.id);
    expect(ids).toContain(secondRefresh.id);
    expect(tokens.length).toBe(1);
  });
});
