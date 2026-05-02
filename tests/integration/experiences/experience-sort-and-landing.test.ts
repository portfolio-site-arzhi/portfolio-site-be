import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";
import { createAccessTokenCookie } from "../../utils/auth";

describe("PATCH /experiences/sort dan GET /landing/experiences", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("update sort mengikuti urutan ids array (vuedraggable)", async () => {
    const { cookie } = await createAccessTokenCookie();
    const a = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        is_published: false,
        role_id: "Role A",
        role_en: "Role A",
        company_name: "Company A",
        start_date: "2020-07-01",
        end_date: "2021-10-01",
        is_current: false,
        description_id: "<p>A</p>",
        description_en: "<p>A</p>",
        skills: [],
      });

    const b = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        is_published: false,
        role_id: "Role B",
        role_en: "Role B",
        company_name: "Company B",
        start_date: "2021-01-01",
        end_date: "2022-01-01",
        is_current: false,
        description_id: "<p>B</p>",
        description_en: "<p>B</p>",
        skills: [],
      });

    const c = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        is_published: false,
        role_id: "Role C",
        role_en: "Role C",
        company_name: "Company C",
        start_date: "2022-01-01",
        end_date: "2023-01-01",
        is_current: false,
        description_id: "<p>C</p>",
        description_en: "<p>C</p>",
        skills: [],
      });

    const ids = [c.body.data.id, a.body.data.id, b.body.data.id];
    const updated = await request(app)
      .patch("/experiences/sort")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({ ids });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Urutan experience berhasil diperbarui");
    expect(updated.body.data).toBe(true);

    const list = await request(app)
      .get("/experiences")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);
    expect(list.status).toBe(200);
    expect(list.body.data.map((x: { id: number }) => x.id)).toEqual(ids);
  });

  it("landing hanya mengembalikan data terpublish dengan locale id+en", async () => {
    const { cookie } = await createAccessTokenCookie();
    await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        is_published: true,
        role_id: "Jabatan ID",
        role_en: "Role EN",
        company_name: "Company Public",
        start_date: "2023-01-01",
        end_date: null,
        is_current: true,
        description_id: "<p>Deskripsi ID</p>",
        description_en: "<p>Description EN</p>",
        skills: [{ skill_name: "TypeScript" }],
      });

    await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        is_published: false,
        role_id: "Draft ID",
        role_en: "Draft EN",
        company_name: "Company Draft",
        start_date: "2020-01-01",
        end_date: "2021-01-01",
        is_current: false,
        description_id: "<p>Draft</p>",
        description_en: "<p>Draft</p>",
        skills: [],
      });

    const response = await request(app)
      .get("/landing/experiences")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        role: {
          id: "Jabatan ID",
          en: "Role EN",
        },
        description: {
          id: "<p>Deskripsi ID</p>",
          en: "<p>Description EN</p>",
        },
      }),
    );
  });
});
