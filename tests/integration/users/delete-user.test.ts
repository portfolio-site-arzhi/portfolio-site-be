import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { resetDatabase } from "../../utils/db";

describe("DELETE /users/:id", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("menghapus user yang ada dan mengembalikan 200", async () => {
    const prisma = getPrisma();

    const createResponse = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .send({
        email: `delete-user-${Date.now()}@example.com`,
        name: "Delete User",
      });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id as number;

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User berhasil dihapus");

    const found = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(found).toBeNull();
  });

  it("mengembalikan 404 jika user tidak ditemukan", async () => {
    const response = await request(app)
      .delete("/users/999999")
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Pengguna tidak ditemukan");
  });

  it("mengembalikan 400 jika id tidak valid", async () => {
    const response = await request(app)
      .delete("/users/invalid-id")
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
