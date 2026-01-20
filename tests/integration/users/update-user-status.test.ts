import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { resetDatabase } from "../../utils/db";

describe("PATCH /users/:id/status", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("mengupdate status user menjadi false dan mengembalikan 200", async () => {
    const prisma = getPrisma();

    const createResponse = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email: `update-status-${Date.now()}@example.com`,
        name: "User Update Status",
      });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id as number;

    const updateStatusResponse = await request(app)
      .patch(`/users/${userId}/status`)
      .set("Accept", "application/json")
      .send({
        status: false,
      });

    expect(updateStatusResponse.status).toBe(200);
    expect(updateStatusResponse.body.data).toEqual(
      expect.objectContaining({
        id: userId,
        status: false,
      }),
    );

    const storedUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(storedUser?.status).toBe(false);
  });

  it("mengembalikan 404 jika user yang diupdate statusnya tidak ditemukan", async () => {
    const response = await request(app)
      .patch("/users/999999/status")
      .set("Accept", "application/json")
      .send({
        status: false,
      });

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Pengguna tidak ditemukan");
  });

  it("mengembalikan 400 jika id tidak valid", async () => {
    const response = await request(app)
      .patch("/users/invalid-id/status")
      .set("Accept", "application/json")
      .send({
        status: false,
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("mengembalikan 400 jika payload status tidak valid", async () => {
    const createResponse = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email: `update-status-invalid-${Date.now()}@example.com`,
        name: "User Update Status Invalid",
      });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id as number;

    const response = await request(app)
      .patch(`/users/${userId}/status`)
      .set("Accept", "application/json")
      .send({
        status: "not-boolean",
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

