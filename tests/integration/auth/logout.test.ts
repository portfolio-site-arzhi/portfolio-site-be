import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";
import { getPrisma } from "../../../src/config";
import { PrismaUserRepository } from "../../../src/repository/userRepository";
import { PrismaRefreshTokenRepository } from "../../../src/repository/refreshTokenRepository";
import { AuthService } from "../../../src/services/authService";

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

  it("logout membuat refresh token sesi saat ini tidak bisa dipakai lagi", async () => {
    const prisma = getPrisma();
    const userRepository = new PrismaUserRepository();
    const refreshTokenRepository = new PrismaRefreshTokenRepository();
    const authService = new AuthService(userRepository, refreshTokenRepository);

    const user = await prisma.user.create({
      data: {
        email: `logout-multilogin-${Date.now()}@example.com`,
        password: "dummy-password",
        name: "Logout Multi Login User",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const firstLogin = await authService.loginWithUser(user);
    await authService.loginWithUser(user);
    const firstRefresh = firstLogin.tokens.refreshToken;

    await authService.logout("", firstRefresh);

    await expect(
      authService.refreshAccessTokenFromRefreshToken(firstRefresh),
    ).rejects.toThrow("REFRESH_TOKEN_INVALID");
  });
});
