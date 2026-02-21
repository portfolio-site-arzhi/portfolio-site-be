import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("CRUD /educations", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("membuat education baru dan mengembalikan 201", async () => {
    const response = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Institut Teknologi",
        degree: "Sarjana",
        degree_en: "Bachelor",
        field_of_study: "Informatika",
        field_of_study_en: "Computer Science",
        start_date: "2018-08-01",
        end_date: "2022-07-01",
        description: "<p>Halo</p><script>alert(1)</script>",
        description_en: "<p>Hello</p><img src=x onerror=alert(1)>",
        location: "Bandung, Indonesia",
        is_active: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        institution_name: "Institut Teknologi",
        degree: "Sarjana",
        degree_en: "Bachelor",
        is_active: true,
        sort_order: expect.any(Number),
      }),
    );
    expect(response.body.data.description).toContain("<p>Halo</p>");
    expect(response.body.data.description).not.toContain("<script");
    expect(response.body.data.description_en).toContain("<p>Hello</p>");
    expect(response.body.data.description_en).not.toContain("onerror");
    expect(response.body.data.description_en).not.toContain("<img");
  });

  it("list mengembalikan data dengan order stabil sort_order asc, id desc", async () => {
    const first = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Inst 1",
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

    const second = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Inst 2",
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

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const list = await request(app).get("/educations").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBe(2);
    expect(list.body.data[0].id).toBe(first.body.data.id);
    expect(list.body.data[1].id).toBe(second.body.data.id);
  });

  it("detail mengembalikan 404 jika id tidak ditemukan", async () => {
    const response = await request(app)
      .get("/educations/999999")
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Education tidak ditemukan");
  });

  it("update dapat mengubah field dan sanitasi description", async () => {
    const created = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Inst",
        degree: "D",
        degree_en: "D",
        field_of_study: "F",
        field_of_study_en: "F",
        start_date: "2018-01-01",
        end_date: null,
        description: "<p>Old</p>",
        description_en: "<p>Old</p>",
        location: null,
        is_active: true,
      });

    const updated = await request(app)
      .put(`/educations/${created.body.data.id}`)
      .set("Accept", "application/json")
      .send({
        institution_name: "Updated Inst",
        description: "<p>New</p><script>alert(1)</script>",
        is_active: false,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.institution_name).toBe("Updated Inst");
    expect(updated.body.data.is_active).toBe(false);
    expect(updated.body.data.description).toContain("<p>New</p>");
    expect(updated.body.data.description).not.toContain("<script");
  });

  it("delete mengembalikan 200 dan list kosong", async () => {
    const created = await request(app)
      .post("/educations")
      .set("Accept", "application/json")
      .send({
        institution_name: "Inst",
        degree: "D",
        degree_en: "D",
        field_of_study: "F",
        field_of_study_en: "F",
        start_date: "2018-01-01",
        end_date: null,
        description: null,
        description_en: null,
        location: null,
        is_active: true,
      });

    const deleted = await request(app)
      .delete(`/educations/${created.body.data.id}`)
      .set("Accept", "application/json");

    expect(deleted.status).toBe(200);
    expect(deleted.body.data).toBe(true);

    const list = await request(app).get("/educations").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });
});
