import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("PATCH /skills/sort dan GET /landing/skills", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("update sort mengikuti urutan ids array (vuedraggable)", async () => {
    const a = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "A",
        is_active: true,
        skills: [],
      });

    const b = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "B",
        is_active: true,
        skills: [],
      });

    const c = await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "C",
        is_active: true,
        skills: [],
      });

    const ids = [c.body.data.id, a.body.data.id, b.body.data.id];
    const updated = await request(app)
      .patch("/skills/sort")
      .set("Accept", "application/json")
      .send({ ids });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Urutan skill berhasil diperbarui");
    expect(updated.body.data).toBe(true);

    const list = await request(app).get("/skills").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.map((x: { id: number }) => x.id)).toEqual(ids);
  });

  it("landing hanya mengembalikan parent aktif", async () => {
    await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "Public Group",
        is_active: true,
        skills: [{ name: "Vue.js" }, { name: "Nuxt" }],
      });

    await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .send({
        name: "Hidden Group",
        is_active: false,
        skills: [{ name: "Should Hidden" }],
      });

    const response = await request(app)
      .get("/landing/skills")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        name: {
          id: "Public Group",
          en: "Public Group",
        },
      }),
    );
    expect(response.body.data[0].skills.length).toBe(2);
    expect(response.body.data[0].skills.map((x: { name: { id: string } }) => x.name.id)).toEqual(
      ["Vue.js", "Nuxt"],
    );
  });
});
