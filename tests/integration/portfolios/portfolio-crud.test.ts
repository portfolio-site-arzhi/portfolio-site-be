import request from "supertest";
import { app } from "../../../src";
import { resetDatabase } from "../../utils/db";

const imageBuffer = Buffer.from("portfolio-image");

const postPortfolio = (payload: Record<string, unknown>) =>
  request(app)
    .post("/portfolios")
    .set("Accept", "application/json")
    .field("payload", JSON.stringify(payload))
    .attach("image", imageBuffer, {
      filename: "portfolio.png",
      contentType: "image/png",
    });

const postPortfolioWithoutImage = (payload: Record<string, unknown>) =>
  request(app)
    .post("/portfolios")
    .set("Accept", "application/json")
    .field("payload", JSON.stringify(payload));

const putPortfolio = (id: number, payload: Record<string, unknown>) =>
  request(app)
    .put(`/portfolios/${id}`)
    .set("Accept", "application/json")
    .field("payload", JSON.stringify(payload));

const putPortfolioWithImage = (id: number, payload: Record<string, unknown>) =>
  putPortfolio(id, payload).attach("image", imageBuffer, {
    filename: "portfolio-new.png",
    contentType: "image/png",
  });

describe("CRUD /portfolios", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("membuat portfolio baru dengan upload image dan sanitasi HTML WYSIWYG di parent", async () => {
    const response = await postPortfolio({
      title: "Ecommerce Dashboard",
      description: "Dashboard analytics untuk toko online",
      description_en: "Analytics dashboard for ecommerce store",
      contribution: "<p>Membangun dashboard</p><script>alert(1)</script>",
      contribution_en: "<p>Built dashboard</p><img src=x onerror=alert(1)>",
      outcome: "<p>Konversi naik</p><script>alert(1)</script>",
      outcome_en: "<p>Higher conversion</p><img src=x onerror=alert(1)>",
      role: "Frontend Lead",
      live_url: "https://demo.example.com/ecommerce-dashboard",
      github_url: "https://github.com/example/ecommerce-dashboard",
      is_published: true,
      published_at: "2026-04-20T09:00:00.000Z",
      stacks: [
        { name: "Vue 3" },
        { name: "PostgreSQL" },
      ],
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Portfolio berhasil dibuat");
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        slug: "ecommerce-dashboard",
        image: expect.stringContaining("/uploads/portfolio/"),
        display_order: expect.any(Number),
        is_published: true,
      }),
    );
    expect(response.body.data.contribution).toContain("<p>Membangun dashboard</p>");
    expect(response.body.data.contribution).not.toContain("<script");
    expect(response.body.data.contribution_en).toContain("<p>Built dashboard</p>");
    expect(response.body.data.contribution_en).not.toContain("onerror");
    expect(response.body.data.outcome).toContain("<p>Konversi naik</p>");
    expect(response.body.data.outcome).not.toContain("<script");
    expect(response.body.data.outcome_en).toContain("<p>Higher conversion</p>");
    expect(response.body.data.outcome_en).not.toContain("onerror");
  });

  it("membuat portfolio baru tanpa image", async () => {
    const response = await postPortfolioWithoutImage({
      title: "Portfolio No Image",
      description: "Desc",
      stacks: [],
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        slug: "portfolio-no-image",
        image: null,
      }),
    );
  });

  it("mengabaikan slug dari payload frontend dan memakai title", async () => {
    const response = await postPortfolio({
      slug: "frontend-manual-slug",
      title: "Backend Generated Slug",
      description: "Desc",
      stacks: [],
    });

    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe("backend-generated-slug");
  });

  it("membuat slug unik otomatis jika title menghasilkan slug yang sama", async () => {
    const first = await postPortfolio({
      title: "Portfolio Same",
      description: "Desc",
      stacks: [],
    });

    const second = await postPortfolio({
      title: "Portfolio Same",
      description: "Desc 2",
      stacks: [],
    });

    expect(first.status).toBe(201);
    expect(first.body.data.slug).toBe("portfolio-same");
    expect(second.status).toBe(201);
    expect(second.body.data.slug).toBe("portfolio-same-2");
  });

  it("list mengembalikan data dengan order stabil display_order asc, id desc", async () => {
    const first = await postPortfolio({
      title: "Portfolio 1",
      description: "Desc 1",
      stacks: [],
    });

    const second = await postPortfolio({
      title: "Portfolio 2",
      description: "Desc 2",
      stacks: [],
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const list = await request(app).get("/portfolios").set("Accept", "application/json");

    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(2);
    expect(list.body.data[0].id).toBe(first.body.data.id);
    expect(list.body.data[1].id).toBe(second.body.data.id);
  });

  it("detail mengembalikan 404 jika id tidak ditemukan", async () => {
    const response = await request(app)
      .get("/portfolios/999999")
      .set("Accept", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.errors).toContain("Portfolio tidak ditemukan");
  });

  it("update dapat mengubah field, mengganti image, dan mengganti penuh child arrays", async () => {
    const created = await postPortfolio({
      title: "Old Portfolio",
      description: "Old description",
      contribution: "<p>Old contribution</p>",
      outcome: "<p>Old outcome</p>",
      stacks: [{ name: "Vue" }],
    });

    const updated = await putPortfolioWithImage(created.body.data.id, {
      title: "New Portfolio",
      status_file: 1,
      contribution: "<p>New contribution</p><script>alert(1)</script>",
      contribution_en: "<p>New contribution EN</p><img src=x onerror=alert(1)>",
      outcome: "<p>New outcome</p>",
      outcome_en: "<p>New outcome EN</p><img src=x onerror=alert(1)>",
      is_published: true,
      published_at: "2026-04-21T12:00:00.000Z",
      stacks: [{ name: "TypeScript" }],
    });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Portfolio berhasil diperbarui");
    expect(updated.body.data.slug).toBe("new-portfolio");
    expect(updated.body.data.image).toContain("/uploads/portfolio/");
    expect(updated.body.data.is_published).toBe(true);
    expect(updated.body.data.stacks.length).toBe(1);
    expect(updated.body.data.stacks[0].name).toBe("TypeScript");
    expect(updated.body.data.contribution).toContain("<p>New contribution</p>");
    expect(updated.body.data.contribution).not.toContain("<script");
    expect(updated.body.data.contribution_en).toContain("<p>New contribution EN</p>");
    expect(updated.body.data.contribution_en).not.toContain("onerror");
    expect(updated.body.data.outcome_en).toContain("<p>New outcome EN</p>");
    expect(updated.body.data.outcome_en).not.toContain("onerror");
  });

  it("update status_file = 0 tidak mengubah image", async () => {
    const created = await postPortfolio({
      title: "Keep Image",
      description: "Desc",
      stacks: [],
    });

    const updated = await putPortfolio(created.body.data.id, {
      status_file: 0,
      title: "Keep Image Updated",
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.image).toBe(created.body.data.image);
    expect(updated.body.data.title).toBe("Keep Image Updated");
  });

  it("update status_file = 1 tanpa image menghapus image", async () => {
    const created = await postPortfolio({
      title: "Remove Image",
      description: "Desc",
      stacks: [],
    });

    const updated = await putPortfolio(created.body.data.id, {
      status_file: 1,
      title: "Remove Image Updated",
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.image).toBeNull();
  });

  it("delete mengembalikan 200 dan list kosong", async () => {
    const created = await postPortfolio({
      title: "To Delete",
      description: "Desc",
      stacks: [],
    });

    const deleted = await request(app)
      .delete(`/portfolios/${created.body.data.id}`)
      .set("Accept", "application/json");

    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Portfolio berhasil dihapus");
    expect(deleted.body.data).toBe(true);

    const list = await request(app).get("/portfolios").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });
});
