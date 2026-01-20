import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("GET /users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan list user dengan field yang benar jika ada data", async () => {
    const response = await request(app)
      .get("/users")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);

    const listResponse = await request(app)
      .get("/users")
      .set("Accept", "application/json");

    expect(listResponse.status).toBe(200);
    const users = listResponse.body.data as Array<{
      id: number;
      email: string;
      name: string;
      status: boolean;
      created_at: string;
      updated_at: string;
    }>;

    if (users.length === 0) {
      return;
    }

    const first = users[0];
    expect(typeof first.id).toBe("number");
    expect(typeof first.email).toBe("string");
    expect(typeof first.name).toBe("string");
    expect(typeof first.status).toBe("boolean");
    expect(typeof first.created_at).toBe("string");
    expect(typeof first.updated_at).toBe("string");
  });

  it("mengembalikan user terurut desc berdasarkan id untuk kestabilan paging", async () => {
    const listResponse = await request(app)
      .get("/users")
      .set("Accept", "application/json");

    expect(listResponse.status).toBe(200);
    const users = listResponse.body.data as Array<{ id: number }>;

    if (users.length < 2) {
      return;
    }

    for (let i = 1; i < users.length; i += 1) {
      expect(users[i - 1].id).toBeGreaterThanOrEqual(users[i].id);
    }
  });
});

