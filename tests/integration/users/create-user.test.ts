import request from "supertest";
import { app } from "../../../src";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

describe("POST /users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan 401 jika belum login", async () => {
    const response = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email: `create-user-${Date.now()}@example.com`,
        name: "Create User",
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("membuat user baru dengan payload valid dan mengembalikan 201", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email: `create-user-${Date.now()}@example.com`,
        name: "Create User",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User berhasil dibuat");
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: expect.stringContaining("create-user-"),
        name: "Create User",
        status: true,
      }),
    );
  });

  it("mengembalikan message sukses bahasa inggris jika Accept-Language=en", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Accept-Language", "en-US")
      .set("Cookie", [cookie])
      .send({
        email: `create-user-en-${Date.now()}@example.com`,
        name: "Create User EN",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  it("mengembalikan 400 jika payload tidak valid", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email: "invalid-email",
        name: "",
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("mengembalikan 400 jika email sudah terdaftar", async () => {
    const { cookie } = await createAccessTokenCookie();
    const email = `duplicate-user-${Date.now()}@example.com`;

    const first = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email,
        name: "First User",
      });

    expect(first.status).toBe(201);
    expect(first.body.message).toBe("User berhasil dibuat");

    const second = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email,
        name: "Second User",
      });

    expect(second.status).toBe(400);
    expect(second.body.errors).toContain("Email sudah terdaftar");
  });
});
