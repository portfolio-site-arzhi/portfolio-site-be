import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("POST /users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("membuat user baru dengan payload valid dan mengembalikan 201", async () => {
    const response = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email: `create-user-${Date.now()}@example.com`,
        name: "Create User",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: expect.stringContaining("create-user-"),
        name: "Create User",
        status: true,
      }),
    );
  });

  it("mengembalikan 400 jika payload tidak valid", async () => {
    const response = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email: "invalid-email",
        name: "",
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("mengembalikan 400 jika email sudah terdaftar", async () => {
    const email = `duplicate-user-${Date.now()}@example.com`;

    const first = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email,
        name: "First User",
      });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email,
        name: "Second User",
      });

    expect(second.status).toBe(400);
    expect(second.body.errors).toContain("Email sudah terdaftar");
  });
});
