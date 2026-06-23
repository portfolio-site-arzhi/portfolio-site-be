import request from "supertest";
import { app } from "../../../src";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

const JSON_CONTENT_TYPE = "application/json";

const binaryParser = (
  res: NodeJS.ReadableStream,
  callback: (error: Error | null, body: Buffer) => void,
) => {
  const chunks: Buffer[] = [];

  res.on("data", (chunk: Buffer | string) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });
  res.on("end", () => {
    callback(null, Buffer.concat(chunks));
  });
  res.on("error", (error: Error) => {
    callback(error, Buffer.alloc(0));
  });
};

const createPortfolioImportBuffer = (payload: unknown): Buffer =>
  Buffer.from(JSON.stringify(payload, null, 2));

describe("GET /portfolios/import/sample dan POST /portfolios/import", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("endpoint sample import dan import portfolio mengembalikan 401 jika belum login", async () => {
    const sampleResponse = await request(app)
      .get("/portfolios/import/sample")
      .set("Accept", JSON_CONTENT_TYPE);

    expect(sampleResponse.status).toBe(401);

    const importResponse = await request(app)
      .post("/portfolios/import")
      .set("Accept", JSON_CONTENT_TYPE);

    expect(importResponse.status).toBe(401);
  });

  it("sample import mengembalikan file JSON template portfolio", async () => {
    const { cookie } = await createAccessTokenCookie();

    const response = await request(app)
      .get("/portfolios/import/sample")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .buffer(true)
      .parse(binaryParser);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain(JSON_CONTENT_TYPE);
    expect(response.headers["content-disposition"]).toContain("attachment");
    expect(response.headers["content-disposition"]).toContain(
      "portfolios-import-sample.json",
    );

    const body = JSON.parse((response.body as Buffer).toString("utf-8")) as {
      portfolios: Array<{
        title: string;
        stacks: Array<{ name: string }>;
      }>;
    };

    expect(Array.isArray(body.portfolios)).toBe(true);
    expect(body.portfolios.length).toBeGreaterThan(0);
    expect(body.portfolios[0].title).toBe("Ecommerce Dashboard");
    expect(body.portfolios[0].stacks.map((stack) => stack.name)).toEqual([
      "Vue 3",
      "PostgreSQL",
    ]);
  });

  it("import dari json menambah portfolio baru, sanitasi HTML, image null, dan urutan display_order mengikuti file", async () => {
    const { cookie } = await createAccessTokenCookie();

    await request(app)
      .post("/portfolios")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .field(
        "payload",
        JSON.stringify({
          title: "Legacy Portfolio",
          description: "Legacy description",
          stacks: [],
        }),
      );

    const payload = createPortfolioImportBuffer({
      portfolios: [
        {
          title: "Imported Dashboard",
          description: "Dashboard analytics untuk toko online",
          description_en: "Analytics dashboard for ecommerce store",
          contribution: "<p>Membangun dashboard</p><script>alert(1)</script>",
          contribution_en: "<p>Built dashboard</p><img src=x onerror=alert(1)>",
          outcome: "<p>Konversi naik</p><script>alert(1)</script>",
          outcome_en: "<p>Higher conversion</p><img src=x onerror=alert(1)>",
          role: "Frontend Lead",
          live_url: "https://demo.example.com/imported-dashboard",
          github_url: "https://github.com/example/imported-dashboard",
          is_published: true,
          published_at: "2026-04-24T09:00:00.000Z",
          stacks: [{ name: "Vue 3" }, { name: "TypeScript" }],
        },
        {
          title: "Internal Notification Service",
          description: "Service internal untuk notifikasi multi channel",
          description_en: "Internal service for multi-channel notifications",
          contribution: "<p>Membangun worker</p>",
          contribution_en: "<p>Built workers</p>",
          outcome: "<p>Pengiriman lebih cepat</p>",
          outcome_en: "<p>Faster delivery</p>",
          role: "Backend Engineer",
          github_url: "https://github.com/example/internal-notification-service",
          is_published: false,
          published_at: null,
          stacks: [{ name: "Node.js" }, { name: "Redis" }],
        },
      ],
    });

    const importResponse = await request(app)
      .post("/portfolios/import")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Accept-Language", "en")
      .set("Cookie", [cookie])
      .attach("file", payload, {
        filename: "portfolios-import.json",
        contentType: JSON_CONTENT_TYPE,
      });

    expect(importResponse.status).toBe(200);
    expect(importResponse.body.message).toBe("Portfolio imported successfully");
    expect(importResponse.body.data.map((item: { title: string }) => item.title)).toEqual([
      "Imported Dashboard",
      "Internal Notification Service",
    ]);
    expect(importResponse.body.data[0].slug).toBe("imported-dashboard");
    expect(importResponse.body.data[0].image).toBeNull();
    expect(importResponse.body.data[0].contribution).toContain(
      "<p>Membangun dashboard</p>",
    );
    expect(importResponse.body.data[0].contribution).not.toContain("<script");
    expect(importResponse.body.data[0].contribution_en).toContain(
      "<p>Built dashboard</p>",
    );
    expect(importResponse.body.data[0].contribution_en).not.toContain("onerror");
    expect(
      importResponse.body.data[0].stacks.map((item: { name: string }) => item.name),
    ).toEqual(["Vue 3", "TypeScript"]);

    const listResponse = await request(app)
      .get("/portfolios")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie]);

    expect(listResponse.status).toBe(200);
    expect(
      listResponse.body.data.map((item: { title: string }) => item.title),
    ).toEqual([
      "Legacy Portfolio",
      "Imported Dashboard",
      "Internal Notification Service",
    ]);
    expect(
      listResponse.body.data.map((item: { display_order: number }) => item.display_order),
    ).toEqual([1, 2, 3]);
    expect(listResponse.body.data[1].image).toBeNull();
    expect(
      listResponse.body.data[2].stacks.map((item: { name: string }) => item.name),
    ).toEqual(["Node.js", "Redis"]);
  });

  it("import mengembalikan 400 jika file json tidak valid", async () => {
    const { cookie } = await createAccessTokenCookie();

    const response = await request(app)
      .post("/portfolios/import")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .attach("file", Buffer.from("{ invalid json"), {
        filename: "portfolios-invalid.json",
        contentType: JSON_CONTENT_TYPE,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain("File JSON portfolio tidak valid");
  });
});
