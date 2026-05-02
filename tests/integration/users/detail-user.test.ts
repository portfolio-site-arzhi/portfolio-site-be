import request from "supertest";
import { app } from "../../../src";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

describe("GET /users/:id", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan 401 jika belum login", async () => {
    const response = await request(app)
      .get("/users/1")
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("mengambil detail user yang sudah dibuat lewat endpoint create", async () => {
    const { cookie } = await createAccessTokenCookie();
    const createResponse = await request(app)
      .post("/users")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        email: `detail-user-${Date.now()}@example.com`,
        name: "Detail User",
      });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id as number;

    const detailResponse = await request(app)
      .get(`/users/${userId}`)
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data).toEqual(
      expect.objectContaining({
        id: userId,
        email: createResponse.body.data.email,
        name: "Detail User",
        status: true,
      }),
    );
  });

  it("mengembalikan 404 jika user tidak ditemukan", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .get("/users/999999")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Pengguna tidak ditemukan");
  });

  it("mengembalikan 400 jika id tidak valid", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .get("/users/invalid-id")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
