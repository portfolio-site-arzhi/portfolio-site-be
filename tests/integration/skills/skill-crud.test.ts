import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("CRUD /skills", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("membuat skill baru dengan child skills berurutan sesuai array", async () => {
    const response = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "Frontend",
        is_active: true,
        skills: [
          { name: "Vue.js" },
          { name: "TypeScript" },
          { name: "Nuxt" },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: "Frontend",
        is_active: true,
        display_order: expect.any(Number),
      }),
    );
    expect(Array.isArray(response.body.data.skills)).toBe(true);
    expect(response.body.data.skills.length).toBe(3);
    expect(response.body.data.skills.map((x: { name: string }) => x.name)).toEqual([
      "Vue.js",
      "TypeScript",
      "Nuxt",
    ]);
    expect(
      response.body.data.skills.map((x: { display_order: number }) => x.display_order),
    ).toEqual([1, 2, 3]);
  });

  it("list mengembalikan data dengan order stabil display_order asc, id asc", async () => {
    const first = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "A",
        is_active: true,
        skills: [],
      });

    const second = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "B",
        is_active: true,
        skills: [],
      });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const list = await request(app).get("/skills").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBe(2);
    expect(list.body.data[0].id).toBe(first.body.data.id);
    expect(list.body.data[1].id).toBe(second.body.data.id);
  });

  it("detail mengembalikan 404 jika id tidak ditemukan", async () => {
    const response = await request(app).get("/skills/999999").set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Skill tidak ditemukan");
  });

  it("update dapat mengganti child skills dan mengikuti urutan array", async () => {
    const created = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "Frontend",
        is_active: true,
        skills: [{ name: "Vue.js" }, { name: "Nuxt" }],
      });

    const updated = await request(app)
      .put(`/skills/${created.body.data.id}`)
      .set("Accept", "application/json")
      .send({
        name: "Frontend Engineering",
        is_active: true,
        skills: [{ name: "TypeScript" }, { name: "Vue.js" }],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe("Frontend Engineering");
    expect(updated.body.data.skills.map((x: { name: string }) => x.name)).toEqual([
      "TypeScript",
      "Vue.js",
    ]);
    expect(
      updated.body.data.skills.map((x: { display_order: number }) => x.display_order),
    ).toEqual([1, 2]);
  });

  it("delete ditolak jika parent masih punya child skill", async () => {
    const created = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "Backend",
        is_active: true,
        skills: [{ name: "Node.js" }],
      });

    const deleted = await request(app)
      .delete(`/skills/${created.body.data.id}`)
      .set("Accept", "application/json");

    expect(deleted.status).toBe(400);
    expect(deleted.body.errors).toContain("Skill masih memiliki child skills");
  });

  it("delete berhasil jika child sudah kosong", async () => {
    const created = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "DevOps",
        is_active: true,
        skills: [{ name: "Docker" }],
      });

    const cleared = await request(app)
      .put(`/skills/${created.body.data.id}`)
      .set("Accept", "application/json")
      .send({
        skills: [],
      });

    expect(cleared.status).toBe(200);
    expect(cleared.body.data.skills.length).toBe(0);

    const deleted = await request(app)
      .delete(`/skills/${created.body.data.id}`)
      .set("Accept", "application/json");

    expect(deleted.status).toBe(200);
    expect(deleted.body.data).toBe(true);
  });
});
