import request from "supertest";
import { app } from "../../src";
import { getPrisma } from "../../src/config";
import { hashPassword } from "../../src/helper/password";
import { resetDatabase } from "../utils/db";

describe("Auth integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("berhasil login dengan email dan password yang benar", async () => {
    const prisma = getPrisma();
    const email = "user@example.com";
    const password = "password123";
    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: "Test User",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .post("/auth/login")
      .set("Accept", "application/json")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(typeof response.body.access_token).toBe("string");
    expect(response.body.user).toMatchObject({
      email,
      name: "Test User",
      status: true,
    });
  });

  it("gagal login jika password salah", async () => {
    const prisma = getPrisma();
    const email = "user2@example.com";
    const passwordHash = await hashPassword("password123");

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: "Test User 2",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .post("/auth/login")
      .set("Accept", "application/json")
      .send({ email, password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  it("gagal login jika user tidak aktif", async () => {
    const prisma = getPrisma();
    const email = "inactive@example.com";
    const passwordHash = await hashPassword("password123");

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: "Inactive User",
        status: false,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .post("/auth/login")
      .set("Accept", "application/json")
      .send({ email, password: "password123" });

    expect(response.status).toBe(403);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});

