import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("PATCH /educations/sort dan GET /landing/educations", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("update sort mengikuti urutan ids array (vuedraggable)", async () => {
    const a = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "A",
        degree: "D1",
        degree_en: "D1",
        field_of_study: "F1",
        field_of_study_en: "F1",
        start_date: "2018-01-01",
        end_date: null,
        description: null,
        description_en: null,
        location: null,
        is_active: true,
      });

    const b = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "B",
        degree: "D2",
        degree_en: "D2",
        field_of_study: "F2",
        field_of_study_en: "F2",
        start_date: "2019-01-01",
        end_date: null,
        description: null,
        description_en: null,
        location: null,
        is_active: true,
      });

    const c = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "C",
        degree: "D3",
        degree_en: "D3",
        field_of_study: "F3",
        field_of_study_en: "F3",
        start_date: "2020-01-01",
        end_date: null,
        description: null,
        description_en: null,
        location: null,
        is_active: true,
      });

    const ids = [c.body.data.id, a.body.data.id, b.body.data.id];
    const updated = await request(app)
      .patch("/educations/sort")
      .set("Accept", "application/json")
      .send({ ids });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Urutan education berhasil diperbarui");
    expect(updated.body.data).toBe(true);

    const list = await request(app).get("/educations").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.map((x: { id: number }) => x.id)).toEqual(ids);
  });

  it("landing hanya mengembalikan data aktif dengan locale id+en", async () => {
    await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Institut Public",
        degree: "Sarjana",
        degree_en: "Bachelor",
        field_of_study: "Informatika",
        field_of_study_en: "Computer Science",
        start_date: "2018-08-01",
        end_date: "2022-07-01",
        description: "<p>Deskripsi ID</p>",
        description_en: "<p>Description EN</p>",
        location: "Bandung",
        is_active: true,
      });

    await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Institut Hidden",
        degree: "Hidden",
        degree_en: "Hidden",
        field_of_study: "Hidden",
        field_of_study_en: "Hidden",
        start_date: "2010-01-01",
        end_date: null,
        description: null,
        description_en: null,
        location: null,
        is_active: false,
      });

    const response = await request(app)
      .get("/landing/educations")
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        institution_name: "Institut Public",
        degree: {
          id: "Sarjana",
          en: "Bachelor",
        },
        field_of_study: {
          id: "Informatika",
          en: "Computer Science",
        },
        description: {
          id: "<p>Deskripsi ID</p>",
          en: "<p>Description EN</p>",
        },
      }),
    );
  });
});
