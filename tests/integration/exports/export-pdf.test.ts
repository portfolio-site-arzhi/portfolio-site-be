import fs from "fs";
import path from "path";
import request from "supertest";
import { app } from "../../../src";
import { getPrisma } from "../../../src/config";
import { resetDatabase } from "../../utils/db";
import { createAccessTokenCookie } from "../../utils/auth";

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

const expectTextOrder = (text: string, values: string[]): void => {
  let previousIndex = -1;

  for (const value of values) {
    const normalizedValue = normalizePdfAssertion(value);
    const currentIndex = text.indexOf(normalizedValue);

    expect(currentIndex).toBeGreaterThan(previousIndex);
    previousIndex = currentIndex;
  }
};

const TEST_PORTFOLIO_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY/jPwPAfAAUAAf+mXJtdAAAAAElFTkSuQmCC";

const removeFileIfExists = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

describe("GET /exports/*.pdf", () => {
  const originalLandingPageUrl = process.env.LANDING_PAGE_URL;

  beforeEach(async () => {
    process.env.LANDING_PAGE_URL = "https://portfolio.example.com";
    await resetDatabase();
  });

  afterEach(() => {
    if (typeof originalLandingPageUrl === "string") {
      process.env.LANDING_PAGE_URL = originalLandingPageUrl;
      return;
    }

    delete process.env.LANDING_PAGE_URL;
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.$disconnect();
  });

  it("mengembalikan PDF CV ATS", async () => {
    const { cookie } = await createAccessTokenCookie();
    const prisma = getPrisma();

    await prisma.siteConfiguration.createMany({
      data: [
        { type: "home", locale: null, key: "name", value: "John Doe", created_by: 0, updated_by: 0 },
        { type: "home", locale: null, key: "position", value: "Backend Engineer", created_by: 0, updated_by: 0 },
        { type: "home", locale: "id", key: "description", value: "Ringkasan profil backend engineer", created_by: 0, updated_by: 0 },
        { type: "home", locale: "en", key: "description", value: "   ", created_by: 0, updated_by: 0 },
        { type: "about", locale: null, key: "email", value: "john@example.com", created_by: 0, updated_by: 0 },
        { type: "about", locale: null, key: "address", value: "Jakarta Indonesia", created_by: 0, updated_by: 0 },
        { type: "about", locale: "id", key: "about_me", value: "Tentang saya backend engineer", created_by: 0, updated_by: 0 },
        { type: "about", locale: "en", key: "about_me", value: "About me backend engineer", created_by: 0, updated_by: 0 },
        { type: "footer", locale: null, key: "linkedin", value: "https://linkedin.com/in/johndoe", created_by: 0, updated_by: 0 },
        { type: "footer", locale: null, key: "github", value: "https://github.com/johndoe", created_by: 0, updated_by: 0 },
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
        description_id: "<ul><li><p>Membangun API internal</p></li><li><p>Meningkatkan performa query</p></li></ul>",
        description_en: "<ul><li><p>Built internal APIs</p></li><li><p>Improved query performance</p></li></ul>",
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

    await prisma.portfolio.createMany({
      data: [
        {
          slug: "project-live",
          title: "Project Live",
          description: "Portfolio dengan live url",
          live_url: "https://demo.example.com/project-live",
          github_url: "https://github.com/example/project-live",
          display_order: 1,
          is_published: true,
          published_at: new Date("2026-01-01T00:00:00.000Z"),
          created_by: 0,
          updated_by: 0,
        },
        {
          slug: "project-github",
          title: "Project GitHub",
          description: "Portfolio dengan github url",
          github_url: "https://github.com/example/project-github",
          display_order: 2,
          is_published: true,
          published_at: new Date("2026-01-02T00:00:00.000Z"),
          created_by: 0,
          updated_by: 0,
        },
        {
          slug: "project-title-only",
          title: "Project Title Only",
          description: "Portfolio tanpa link",
          display_order: 3,
          is_published: true,
          published_at: new Date("2026-01-03T00:00:00.000Z"),
          created_by: 0,
          updated_by: 0,
        },
        {
          slug: "project-draft",
          title: "Project Draft",
          description: "Portfolio draft",
          live_url: "https://demo.example.com/project-draft",
          display_order: 4,
          is_published: false,
          published_at: new Date("2026-01-04T00:00:00.000Z"),
          created_by: 0,
          updated_by: 0,
        },
      ],
    });

    const response = await request(app)
      .get("/exports/cv")
      .set("Accept", "application/pdf")
      .set("Cookie", [cookie])
      .buffer(true)
      .parse(binaryParser);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain("cv-ats-en.pdf");
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.slice(0, 5).toString("latin1")).toBe("%PDF-");

    const pdfText = normalizePdfAssertion(extractPdfText(response.body));
    expect(pdfText).toContain(normalizePdfAssertion("John Doe"));
    expect(pdfText).toContain(normalizePdfAssertion("Jakarta Indonesia"));
    expect(pdfText).toContain(normalizePdfAssertion("Backend Engineer"));
    expect(pdfText).toContain(normalizePdfAssertion("Ringkasan profil backend engineer"));
    expect(pdfText).toContain(normalizePdfAssertion("About me backend engineer"));
    expect(pdfText).toContain(normalizePdfAssertion("https://portfolio.example.com"));
    expect(pdfText).toContain(normalizePdfAssertion("https://linkedin.com/in/johndoe"));
    expect(pdfText).toContain(normalizePdfAssertion("https://github.com/johndoe"));
    expect(pdfText).toContain(normalizePdfAssertion("https://demo.example.com/project-live"));
    expect(pdfText).toContain(normalizePdfAssertion("https://github.com/example/project-github"));
    expect(pdfText).toContain(normalizePdfAssertion("Project Title Only"));
    expect(pdfText).not.toContain(normalizePdfAssertion("https://demo.example.com/project-draft"));
    expect(pdfText).toContain(normalizePdfAssertion("Built internal APIs"));
    expect(pdfText).toContain(normalizePdfAssertion("Improved query performance"));
    expect(pdfText).not.toContain(normalizePdfAssertion("Exported at"));
    expectTextOrder(pdfText, [
      "Core Skills",
      "Built internal APIs",
      "Bachelor of Computer Science",
      "AWS Associate",
      "https://demo.example.com/project-live",
    ]);
  });

  it("mengembalikan PDF detail portfolio", async () => {
    const { cookie } = await createAccessTokenCookie();
    const prisma = getPrisma();
    const imageDir = path.join(process.cwd(), "uploads", "portfolio");
    const imagePath = path.join(imageDir, "project-alpha.png");

    await prisma.portfolio.create({
      data: {
        slug: "project-alpha",
        title: "Project Alpha",
        description: "Portfolio deskripsi indonesia",
        description_en: "Portfolio description english",
        contribution: "<ul><li><p>Membangun API utama</p></li><li><p>Merapikan arsitektur service</p></li></ul>",
        contribution_en: "   ",
        outcome: "<p>Latensi turun signifikan</p>",
        outcome_en: "<ul><li><p>Latency dropped significantly</p></li><li><p>Improved release confidence</p></li></ul>",
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

    fs.mkdirSync(imageDir, { recursive: true });
    fs.writeFileSync(imagePath, Buffer.from(TEST_PORTFOLIO_IMAGE_BASE64, "base64"));

    try {
      const response = await request(app)
        .get("/exports/portfolios?locale=en")
        .set("Accept", "application/pdf")
        .set("Cookie", [cookie])
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
      expect(pdfText).toContain(normalizePdfAssertion("Portfolio description english"));
      expect(pdfText).toContain(normalizePdfAssertion("Membangun API utama"));
      expect(pdfText).toContain(normalizePdfAssertion("Merapikan arsitektur service"));
      expect(pdfText).toContain(normalizePdfAssertion("Latency dropped significantly"));
      expect(pdfText).toContain(normalizePdfAssertion("Improved release confidence"));
      expect(pdfText).not.toContain(normalizePdfAssertion("Exported at"));
      expect(response.body.toString("latin1")).toContain("/Subtype /Image");
    } finally {
      removeFileIfExists(imagePath);
    }
  });

  it("endpoint export mengembalikan 401 jika belum login", async () => {
    const cvResponse = await request(app)
      .get("/exports/cv")
      .set("Accept", "application/pdf");

    expect(cvResponse.status).toBe(401);
    expect(cvResponse.body.errors).toContain("Token akses tidak ditemukan");

    const portfolioResponse = await request(app)
      .get("/exports/portfolios?locale=en")
      .set("Accept", "application/pdf");

    expect(portfolioResponse.status).toBe(401);
    expect(portfolioResponse.body.errors).toContain("Token akses tidak ditemukan");
  });
});
