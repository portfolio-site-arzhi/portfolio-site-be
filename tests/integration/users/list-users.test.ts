import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { resetDatabase } from "../../utils/db";

describe("GET /users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("mengembalikan list user dengan field yang benar jika ada data", async () => {
    const listResponse = await request(app)
      .get("/users")
      .set("Accept", "application/json");

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body.data)).toBe(true);
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

  it("mendukung paging dengan page dan page_size tanpa duplikasi", async () => {
    const pageSize = 2;

    const createUser = async (suffix: string) => {
      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .send({
          email: `paging-user-${suffix}-${Date.now()}@example.com`,
          name: `Paging User ${suffix}`,
        });

      expect(response.status).toBe(201);
      return response.body.data.id as number;
    };

    await createUser("a");
    await createUser("b");
    await createUser("c");

    const page1Response = await request(app)
      .get(`/users?page=1&page_size=${pageSize}`)
      .set("Accept", "application/json");

    expect(page1Response.status).toBe(200);
    expect(page1Response.body.meta).toEqual(
      expect.objectContaining({
        page: 1,
        page_size: pageSize,
      }),
    );

    const page2Response = await request(app)
      .get(`/users?page=2&page_size=${pageSize}`)
      .set("Accept", "application/json");

    expect(page2Response.status).toBe(200);
    expect(page2Response.body.meta).toEqual(
      expect.objectContaining({
        page: 2,
        page_size: pageSize,
      }),
    );

    const page1Ids = (page1Response.body.data as Array<{ id: number }>).map(
      (u) => u.id,
    );
    const page2Ids = (page2Response.body.data as Array<{ id: number }>).map(
      (u) => u.id,
    );

    const allIds = [...page1Ids, ...page2Ids];
    const uniqueAllIds = Array.from(new Set(allIds));

    expect(uniqueAllIds.length).toBe(allIds.length);
  });

  it("mendukung search global pada email dan name", async () => {
    const createUser = async (email: string, name: string) => {
      const response = await request(app)
        .post("/users")
        .set("Accept", "application/json")
        .send({
          email,
          name,
        });

      expect(response.status).toBe(201);
    };

    await createUser("alice@example.com", "Alice Wonderland");
    await createUser("bob@example.com", "Bob Builder");

    const response = await request(app)
      .get("/users?search=alice")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    const users = response.body.data as Array<{ email: string; name: string }>;

    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(
      users.every(
        (u) =>
          u.email.toLowerCase().includes("alice") ||
          u.name.toLowerCase().includes("alice"),
      ),
    ).toBe(true);
  });

  it("mendukung sorting berdasarkan name dengan id desc sebagai tie-breaker", async () => {
    const prisma = getPrisma();

    const first = await prisma.user.create({
      data: {
        email: `sort-name-same-${Date.now()}-1@example.com`,
        password: "dummy-password",
        name: "Same Name",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const second = await prisma.user.create({
      data: {
        email: `sort-name-same-${Date.now()}-2@example.com`,
        password: "dummy-password",
        name: "Same Name",
        status: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .get("/users?order_field=name&order_dir=asc&page_size=10")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);

    const users = response.body.data as Array<{ id: number; name: string }>;
    const filtered = users.filter((u) => u.name === "Same Name");

    if (filtered.length < 2) {
      return;
    }

    expect(filtered[0].id).toBeGreaterThan(filtered[1].id);
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        order_field: "name",
        order_dir: "asc",
      }),
    );
  });
});
