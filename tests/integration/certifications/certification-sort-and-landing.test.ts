import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("PATCH /certifications/sort dan GET /landing/certifications", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("update sort mengikuti urutan ids array (vuedraggable)", async () => {
    const a = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .send({
        name: "A",
        name_en: "A",
        issuing_organization: "Org A",
        issue_date: "2023-01-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    const b = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .send({
        name: "B",
        name_en: "B",
        issuing_organization: "Org B",
        issue_date: "2023-02-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    const c = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .send({
        name: "C",
        name_en: "C",
        issuing_organization: "Org C",
        issue_date: "2023-03-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    const ids = [b.body.data.id, c.body.data.id, a.body.data.id];
    const updated = await request(app)
      .patch("/certifications/sort")
      .set("Accept", "application/json")
      .send({ ids });

    expect(updated.status).toBe(200);
    expect(updated.body.data).toBe(true);

    const list = await request(app)
      .get("/certifications")
      .set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.map((x: { id: number }) => x.id)).toEqual(ids);
  });

  it("landing hanya mengembalikan data aktif dengan locale id+en", async () => {
    await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .send({
        name: "Nama ID",
        name_en: "Name EN",
        issuing_organization: "Issuer Public",
        issue_date: "2024-01-01",
        description: "<p>Deskripsi ID</p>",
        description_en: "<p>Description EN</p>",
        is_active: true,
      });

    await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .send({
        name: "Hidden",
        name_en: "Hidden",
        issuing_organization: "Issuer Hidden",
        issue_date: "2020-01-01",
        description: null,
        description_en: null,
        is_active: false,
      });

    const response = await request(app)
      .get("/landing/certifications")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        name: {
          id: "Nama ID",
          en: "Name EN",
        },
        issuing_organization: "Issuer Public",
        description: {
          id: "<p>Deskripsi ID</p>",
          en: "<p>Description EN</p>",
        },
      }),
    );
  });
});
