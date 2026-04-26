import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { resetDatabase } from "../../utils/db";

const binaryParser = (
  res: NodeJS.ReadableStream,
  callback: (error: Error | null, body: Buffer) => void,
) => {
  const chunks: Buffer[] = [];

  res.on("data", (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });
  res.on("end", () => {
    callback(null, Buffer.concat(chunks));
  });
  res.on("error", (error) => {
    callback(error as Error, Buffer.alloc(0));
  });
};

const extractPdfText = (buffer: Buffer): string =>
  Array.from(buffer.toString("latin1").matchAll(/<([0-9A-Fa-f]+)>/g))
    .map((match) => Buffer.from(match[1], "hex").toString("latin1"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

const normalizePdfAssertion = (value: string): string =>
  value.replace(/[^a-zA-Z0-9@.:/-]+/g, "").toLowerCase();

describe("GET /exports/*.pdf", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("mengembalikan PDF CV ATS", async () => {
    const prisma = getPrisma();

    await prisma.siteConfiguration.createMany({
      data: [
        { type: "home", locale: null, key: "name", value: "John Doe", created_by: 0, updated_by: 0 },
        { type: "home", locale: null, key: "position", value: "Backend Engineer", created_by: 0, updated_by: 0 },
        { type: "home", locale: "id", key: "description", value: "Ringkasan profil backend engineer", created_by: 0, updated_by: 0 },
        { type: "home", locale: "en", key: "description", value: "Professional backend engineer summary", created_by: 0, updated_by: 0 },
        { type: "about", locale: null, key: "email", value: "john@example.com", created_by: 0, updated_by: 0 },
        { type: "about", locale: null, key: "address", value: "Jakarta Indonesia", created_by: 0, updated_by: 0 },
        { type: "about", locale: "id", key: "about_me", value: "Tentang saya backend engineer", created_by: 0, updated_by: 0 },
        { type: "about", locale: "en", key: "about_me", value: "About me backend engineer", created_by: 0, updated_by: 0 },
      ],
    });

    await prisma.skillGroup.create({
      data: {
        name: "Backend",
        display_order: 1,
        is_active: true,
        created_by: 0,
        updated_by: 0,
        skills: {
          create: [
            {
              name: "Node.js",
              display_order: 1,
              created_by: 0,
              updated_by: 0,
            },
          ],
        },
      },
    });

    await prisma.experience.create({
      data: {
        sort: 1,
        is_published: true,
        role_id: "Backend Engineer",
        role_en: "Backend Engineer",
        company_name: "Acme Corp",
        company_url: "https://acme.example.com",
        start_date: new Date("2024-01-01"),
        end_date: null,
        is_current: true,
        description_id: "Membangun API internal",
        description_en: "Built internal APIs",
        created_by: 0,
        updated_by: 0,
        skills: {
          create: [
            {
              skill_name: "Node.js",
              sort: 1,
              created_by: 0,
              updated_by: 0,
            },
          ],
        },
      },
    });

    await prisma.education.create({
      data: {
        institution_name: "Tech University",
        degree: "Sarjana Komputer",
        degree_en: "Bachelor of Computer Science",
        field_of_study: "Informatika",
        field_of_study_en: "Computer Science",
        start_date: new Date("2018-08-01"),
        end_date: new Date("2022-06-01"),
        description: "Lulus dengan fokus backend",
        description_en: "Graduated with backend focus",
        location: "Jakarta",
        sort_order: 1,
        is_active: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    await prisma.certification.create({
      data: {
        name: "AWS Associate",
        name_en: "AWS Associate",
        issuing_organization: "Amazon",
        issue_date: new Date("2025-01-01"),
        description: "Sertifikasi cloud",
        description_en: "Cloud certification",
        sort_order: 1,
        is_active: true,
        created_by: 0,
        updated_by: 0,
      },
    });

    const response = await request(app)
      .get("/exports/cv?locale=id")
      .set("Accept", "application/pdf")
      .buffer(true)
      .parse(binaryParser);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain("cv-ats-id.pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.slice(0, 5).toString("latin1")).toBe("%PDF-");

    const pdfText = normalizePdfAssertion(extractPdfText(response.body));
    expect(pdfText).toContain(normalizePdfAssertion("John Doe"));
    expect(pdfText).toContain(normalizePdfAssertion("Jakarta Indonesia"));
    expect(pdfText).toContain(normalizePdfAssertion("Backend Engineer"));
  });

  it("mengembalikan PDF detail portfolio", async () => {
    const prisma = getPrisma();

    await prisma.portfolio.create({
      data: {
        slug: "project-alpha",
        title: "Project Alpha",
        description: "Portfolio deskripsi indonesia",
        description_en: "Portfolio description english",
        contribution: "<p>Membangun API utama</p>",
        contribution_en: "<p>Built the core API</p>",
        outcome: "<p>Latensi turun signifikan</p>",
        outcome_en: "<p>Latency dropped significantly</p>",
        image: "/uploads/portfolio/project-alpha.png",
        role: "Lead Engineer",
        live_url: "https://demo.example.com/project-alpha",
        github_url: "https://github.com/example/project-alpha",
        display_order: 1,
        is_published: true,
        published_at: new Date("2026-01-01T00:00:00.000Z"),
        created_by: 0,
        updated_by: 0,
        stacks: {
          create: [
            {
              name: "Node.js",
              display_order: 1,
              created_by: 0,
              updated_by: 0,
            },
          ],
        },
      },
    });

    const response = await request(app)
      .get("/exports/portfolios?locale=en")
      .set("Accept", "application/pdf")
      .buffer(true)
      .parse(binaryParser);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain("portfolio-detail-en.pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.slice(0, 5).toString("latin1")).toBe("%PDF-");

    const pdfText = normalizePdfAssertion(extractPdfText(response.body));
    expect(pdfText).toContain(normalizePdfAssertion("Portfolio Detail Collection"));
    expect(pdfText).toContain(normalizePdfAssertion("project-alpha"));
    expect(pdfText).toContain(normalizePdfAssertion("Project Alpha"));
  });
});
