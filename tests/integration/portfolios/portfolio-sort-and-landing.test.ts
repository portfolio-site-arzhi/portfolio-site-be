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

describe("PATCH /portfolios/sort dan GET /landing/portfolios", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("update sort mengikuti urutan ids array (vuedraggable)", async () => {
    const a = await postPortfolio({
      title: "Portfolio A",
      description: "Desc A",
      stacks: [],
    });

    const b = await postPortfolio({
      title: "Portfolio B",
      description: "Desc B",
      stacks: [],
    });

    const c = await postPortfolio({
      title: "Portfolio C",
      description: "Desc C",
      stacks: [],
    });

    const ids = [c.body.data.id, a.body.data.id, b.body.data.id];
    const updated = await request(app)
      .patch("/portfolios/sort")
      .set("Accept", "application/json")
      .send({ ids });

    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Urutan portfolio berhasil diperbarui");
    expect(updated.body.data).toBe(true);

    const list = await request(app).get("/portfolios").set("Accept", "application/json");
    expect(list.status).toBe(200);
    expect(list.body.data.map((item: { id: number }) => item.id)).toEqual(ids);
  });

  it("landing hanya mengembalikan data published yang waktunya sudah aktif dan detail by slug memuat field WYSIWYG locale", async () => {
    await postPortfolio({
      title: "Portfolio Publish",
      description: "Deskripsi publish",
      description_en: "Published description",
      contribution: "<p>Kontribusi ID</p>",
      contribution_en: "<p>Contribution EN</p>",
      outcome: "<p>Outcome ID</p>",
      outcome_en: "<p>Outcome EN</p>",
      role: "Backend Developer",
      live_url: "https://example.com/live",
      github_url: "https://github.com/example/published",
      is_published: true,
      published_at: "2026-04-20T10:00:00.000Z",
      stacks: [{ name: "Node.js" }],
    });

    await postPortfolio({
      title: "Portfolio Draft",
      description: "Draft",
      is_published: false,
      stacks: [],
    });

    await postPortfolio({
      title: "Portfolio Scheduled",
      description: "Scheduled",
      is_published: true,
      published_at: "2099-01-01T00:00:00.000Z",
      stacks: [],
    });

    const list = await request(app)
      .get("/landing/portfolios")
      .set("Accept", "application/json");

    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0]).toEqual(
      expect.objectContaining({
        slug: "portfolio-publish",
        title: "Portfolio Publish",
        image: expect.stringContaining("/uploads/portfolio/"),
        role: "Backend Developer",
        description: {
          id: "Deskripsi publish",
          en: "Published description",
        },
      }),
    );

    const detail = await request(app)
      .get("/landing/portfolios/portfolio-publish")
      .set("Accept", "application/json");

    expect(detail.status).toBe(200);
    expect(detail.body.data).toEqual(
      expect.objectContaining({
        slug: "portfolio-publish",
        image: expect.stringContaining("/uploads/portfolio/"),
        stacks: [
          expect.objectContaining({
            name: "Node.js",
          }),
        ],
        contribution: {
          id: "<p>Kontribusi ID</p>",
          en: "<p>Contribution EN</p>",
        },
        outcome: {
          id: "<p>Outcome ID</p>",
          en: "<p>Outcome EN</p>",
        },
      }),
    );
  });

  it("detail landing mengembalikan 404 untuk slug draft atau terjadwal", async () => {
    await postPortfolio({
      title: "Hidden Portfolio",
      description: "Desc",
      is_published: true,
      published_at: "2099-01-01T00:00:00.000Z",
      stacks: [],
    });

    const detail = await request(app)
      .get("/landing/portfolios/hidden-portfolio")
      .set("Accept", "application/json");

    expect(detail.status).toBe(404);
    expect(detail.body.errors).toContain("Portfolio tidak ditemukan");
  });
});
