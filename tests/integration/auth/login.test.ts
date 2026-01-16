import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";
import { getPrisma } from "../../../src/config";

describe("GET /auth/google", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("redirects to Google OAuth page", async () => {
    const response = await request(app)
      .get("/auth/google")
      .set("Accept", "application/json");

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("accounts.google.com");
  });
});
