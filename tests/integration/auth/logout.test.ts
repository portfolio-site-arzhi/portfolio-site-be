import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

import { getPrisma } from "../../../src/config";

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
});
