import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

describe("PUT /users/:id", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("mengembalikan 401 jika belum login", async () => {
    const response = await request(app)
      .put("/users/1")
      .set("Accept", "application/json")
      .send({
        name: "New Name",
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("mengupdate name user yang dibuat lewat endpoint create (password dikelola sistem)", async () => {
    const { cookie } = await createAccessTokenCookie();
    const prisma = getPrisma();

    const createResponse = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email: `update-user-${Date.now()}@example.com`,
        name: "Old Name",
      });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id as number;

    const beforeUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!beforeUpdate) {
      throw new Error("Expected user to exist before update");
    }
    const originalPassword = beforeUpdate.password;
    expect(originalPassword).toMatch(/^\$2[aby]\$/);

    const updateResponse = await request(app)
      .put(`/users/${userId}`)
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "New Name",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe("User berhasil diperbarui");
    expect(updateResponse.body.data.name).toBe("New Name");

    const storedUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(storedUser?.password).toBe(originalPassword);
  });

  it("mengembalikan 404 jika user yang diupdate tidak ditemukan", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .put("/users/999999")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Does Not Matter",
      });

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Pengguna tidak ditemukan");
  });

  it("mengembalikan 400 jika id tidak valid", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .put("/users/invalid-id")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Any Name",
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("mengembalikan 400 jika payload update tidak valid", async () => {
    const { cookie } = await createAccessTokenCookie();
    const createResponse = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email: `update-invalid-${Date.now()}@example.com`,
        name: "Valid Name",
      });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id as number;

    const response = await request(app)
      .put(`/users/${userId}`)
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "",
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
