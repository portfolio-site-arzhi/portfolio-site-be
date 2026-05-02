import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";
import { createAccessTokenCookie } from "../../utils/auth";

describe("CRUD /certifications", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("semua endpoint CMS certification mengembalikan 401 jika belum login", async () => {
    const { cookie } = await createAccessTokenCookie();
    const created = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Protected",
        name_en: "Protected",
        issuing_organization: "Issuer",
        issue_date: "2024-01-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    expect(created.status).toBe(201);

    const list = await request(app)
      .get("/certifications")
      .set("Accept", "application/json");
    expect(list.status).toBe(401);
    expect(list.body.errors).toContain("Token akses tidak ditemukan");

    const detail = await request(app)
      .get(`/certifications/${created.body.data.id}`)
      .set("Accept", "application/json");
    expect(detail.status).toBe(401);
    expect(detail.body.errors).toContain("Token akses tidak ditemukan");

    const create = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .send({
        name: "Sertifikasi ID",
        name_en: "Certification EN",
        issuing_organization: "Issuer Inc",
        issue_date: "2024-01-01",
        description: null,
        description_en: null,
        is_active: true,
      });
    expect(create.status).toBe(401);
    expect(create.body.errors).toContain("Token akses tidak ditemukan");

    const update = await request(app)
      .put(`/certifications/${created.body.data.id}`)
      .set("Accept", "application/json")
      .send({
        name: "Updated",
      });
    expect(update.status).toBe(401);
    expect(update.body.errors).toContain("Token akses tidak ditemukan");

    const remove = await request(app)
      .delete(`/certifications/${created.body.data.id}`)
      .set("Accept", "application/json");
    expect(remove.status).toBe(401);
    expect(remove.body.errors).toContain("Token akses tidak ditemukan");

    const sort = await request(app)
      .patch("/certifications/sort")
      .set("Accept", "application/json")
      .send({ ids: [created.body.data.id] });
    expect(sort.status).toBe(401);
    expect(sort.body.errors).toContain("Token akses tidak ditemukan");
  });

  it("membuat certification baru dan mengembalikan 201", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Sertifikasi ID",
        name_en: "Certification EN",
        issuing_organization: "Issuer Inc",
        issue_date: "2024-01-01",
        description: "<p>Halo</p><script>alert(1)</script>",
        description_en: "<p>Hello</p><img src=x onerror=alert(1)>",
        is_active: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Certification berhasil dibuat");
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: "Sertifikasi ID",
        name_en: "Certification EN",
        issuing_organization: "Issuer Inc",
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
    const { cookie } = await createAccessTokenCookie();
    const first = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "A",
        name_en: "A",
        issuing_organization: "Org A",
        issue_date: "2023-01-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    const second = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "B",
        name_en: "B",
        issuing_organization: "Org B",
        issue_date: "2023-02-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const list = await request(app)
      .get("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBe(2);
    expect(list.body.data[0].id).toBe(first.body.data.id);
    expect(list.body.data[1].id).toBe(second.body.data.id);
  });

  it("detail mengembalikan 404 jika id tidak ditemukan", async () => {
    const { cookie } = await createAccessTokenCookie();
    const response = await request(app)
      .get("/certifications/999999")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Certification tidak ditemukan");
  });

  it("update dapat mengubah field dan sanitasi description", async () => {
    const { cookie } = await createAccessTokenCookie();
    const created = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Old",
        name_en: "Old",
        issuing_organization: "Org",
        issue_date: "2023-01-01",
        description: "<p>Old</p>",
        description_en: "<p>Old</p>",
        is_active: true,
      });

    const updated = await request(app)
      .put(`/certifications/${created.body.data.id}`)
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Updated",
        description: "<p>New</p><script>alert(1)</script>",
        is_active: false,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Certification berhasil diperbarui");
    expect(updated.body.data.name).toBe("Updated");
    expect(updated.body.data.is_active).toBe(false);
    expect(updated.body.data.description).toContain("<p>New</p>");
    expect(updated.body.data.description).not.toContain("<script");
  });

  it("delete mengembalikan 200 dan list kosong", async () => {
    const { cookie } = await createAccessTokenCookie();
    const created = await request(app)
      .post("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "To Delete",
        name_en: "To Delete",
        issuing_organization: "Org",
        issue_date: "2023-01-01",
        description: null,
        description_en: null,
        is_active: true,
      });

    const deleted = await request(app)
      .delete(`/certifications/${created.body.data.id}`)
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);

    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Certification berhasil dihapus");
    expect(deleted.body.data).toBe(true);

    const list = await request(app)
      .get("/certifications")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });
});
