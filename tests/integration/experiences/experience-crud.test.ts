import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

describe("CRUD /experiences", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("membuat experience baru dan mengembalikan 201", async () => {
    const response = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .send({
        is_published: true,
        role_id: "Senior Frontend Developer",
        role_en: "Senior Frontend Developer",
        company_name: "Tech Solutions Inc.",
        company_url: "https://example.com",
        start_date: "2023-07-01",
        end_date: null,
        is_current: true,
        description_id: "<p>Halo</p><script>alert(1)</script>",
        description_en: "<p>Hello</p><img src=x onerror=alert(1)>",
        skills: [{ skill_name: "TypeScript" }, { skill_name: "Vue" }],
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Experience berhasil dibuat");
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        sort: expect.any(Number),
        is_published: true,
        company_name: "Tech Solutions Inc.",
        company_url: "https://example.com",
        is_current: true,
      }),
    );
    expect(response.body.data.description_id).toContain("<p>Halo</p>");
    expect(response.body.data.description_id).not.toContain("<script");
    expect(response.body.data.description_en).toContain("<p>Hello</p>");
    expect(response.body.data.description_en).not.toContain("onerror");
    expect(Array.isArray(response.body.data.skills)).toBe(true);
    expect(response.body.data.skills.length).toBe(2);
  });

  it("mengembalikan 400 jika end_date diisi saat is_current = true", async () => {
    const response = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .send({
        is_published: true,
        role_id: "Role ID",
        role_en: "Role EN",
        company_name: "Company",
        start_date: "2023-01-01",
        end_date: "2025-01-01",
        is_current: true,
        description_id: "<p>Halo</p>",
        description_en: "<p>Hello</p>",
        skills: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain("end_date harus null jika is_current = true");
  });

  it("list mengembalikan data dengan order stabil sort asc, id desc", async () => {
    const first = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .send({
        is_published: false,
        role_id: "Role 1",
        role_en: "Role 1",
        company_name: "Company 1",
        start_date: "2023-01-01",
        end_date: "2024-01-01",
        is_current: false,
        description_id: "<p>One</p>",
        description_en: "<p>One</p>",
        skills: [],
      });

    const second = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .send({
        is_published: false,
        role_id: "Role 2",
        role_en: "Role 2",
        company_name: "Company 2",
        start_date: "2022-01-01",
        end_date: "2023-01-01",
        is_current: false,
        description_id: "<p>Two</p>",
        description_en: "<p>Two</p>",
        skills: [],
      });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const list = await request(app).get("/experiences").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBe(2);
    expect(list.body.data[0].id).toBe(first.body.data.id);
    expect(list.body.data[1].id).toBe(second.body.data.id);
  });

  it("detail mengembalikan 404 jika id tidak ditemukan", async () => {
    const response = await request(app)
      .get("/experiences/999999")
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Experience tidak ditemukan");
  });

  it("update dapat mengubah field dan sanitasi description", async () => {
    const created = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .send({
        is_published: false,
        role_id: "Role 1",
        role_en: "Role 1",
        company_name: "Company 1",
        start_date: "2023-01-01",
        end_date: "2024-01-01",
        is_current: false,
        description_id: "<p>Old</p>",
        description_en: "<p>Old</p>",
        skills: [{ skill_name: "OldSkill" }],
      });

    const updated = await request(app)
      .put(`/experiences/${created.body.data.id}`)
      .set("Accept", "application/json")
      .send({
        is_published: true,
        description_id: "<p>New</p><script>alert(1)</script>",
        skills: [{ skill_name: "NewSkill" }],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Experience berhasil diperbarui");
    expect(updated.body.data.is_published).toBe(true);
    expect(updated.body.data.description_id).toContain("<p>New</p>");
    expect(updated.body.data.description_id).not.toContain("<script");
    expect(updated.body.data.skills.length).toBe(1);
    expect(updated.body.data.skills[0].skill_name).toBe("NewSkill");
  });

  it("delete mengembalikan 200 dan list kosong", async () => {
    const created = await request(app)
      .post("/experiences")
      .set("Accept", "application/json")
      .send({
        is_published: false,
        role_id: "Role 1",
        role_en: "Role 1",
        company_name: "Company 1",
        start_date: "2023-01-01",
        end_date: "2024-01-01",
        is_current: false,
        description_id: "<p>Old</p>",
        description_en: "<p>Old</p>",
        skills: [],
      });

    const deleted = await request(app)
      .delete(`/experiences/${created.body.data.id}`)
      .set("Accept", "application/json");

    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Experience berhasil dihapus");
    expect(deleted.body.data).toBe(true);

    const list = await request(app).get("/experiences").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });
});
