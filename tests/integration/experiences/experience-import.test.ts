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

const createExperienceImportBuffer = (payload: unknown): Buffer =>
  Buffer.from(JSON.stringify(payload, null, 2));

describe("GET /experiences/import/sample dan POST /experiences/import", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("endpoint sample import dan import experience mengembalikan 401 jika belum login", async () => {
    const sampleResponse = await request(app)
      .get("/experiences/import/sample")
      .set("Accept", JSON_CONTENT_TYPE);

    expect(sampleResponse.status).toBe(401);

    const importResponse = await request(app)
      .post("/experiences/import")
      .set("Accept", JSON_CONTENT_TYPE);

    expect(importResponse.status).toBe(401);
  });

  it("sample import mengembalikan file JSON template", async () => {
    const { cookie } = await createAccessTokenCookie();

    const response = await request(app)
      .get("/experiences/import/sample")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .buffer(true)
      .parse(binaryParser);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain(JSON_CONTENT_TYPE);
    expect(response.headers["content-disposition"]).toContain("attachment");
    expect(response.headers["content-disposition"]).toContain(
      "experiences-import-sample.json",
    );

    const body = JSON.parse((response.body as Buffer).toString("utf-8")) as {
      experiences: Array<{
        role_id: string;
        skills: Array<{ skill_name: string }>;
      }>;
    };

    expect(Array.isArray(body.experiences)).toBe(true);
    expect(body.experiences.length).toBeGreaterThan(0);
    expect(body.experiences[0].role_id).toBe("Senior Frontend Developer");
    expect(body.experiences[0].skills.map((skill) => skill.skill_name)).toEqual([
      "TypeScript",
      "Vue.js",
    ]);
  });

  it("import dari json hanya menambah data baru, sanitasi description, dan urutan sort mengikuti file", async () => {
    const { cookie } = await createAccessTokenCookie();

    await request(app)
      .post("/experiences")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .send({
        is_published: false,
        role_id: "Legacy Role",
        role_en: "Legacy Role",
        company_name: "Legacy Company",
        start_date: "2020-01-01",
        end_date: "2021-01-01",
        is_current: false,
        description_id: "<p>Legacy</p>",
        description_en: "<p>Legacy</p>",
        skills: [{ skill_name: "Legacy Skill" }],
      });

    const payload = createExperienceImportBuffer({
      experiences: [
        {
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
          skills: [{ skill_name: "TypeScript" }, { skill_name: "Vue.js" }],
        },
        {
          is_published: false,
          role_id: "Backend Developer",
          role_en: "Backend Developer",
          company_name: "API Works",
          company_url: null,
          start_date: "2021-01-01",
          end_date: "2023-06-01",
          is_current: false,
          description_id: "<p>Bangun API</p>",
          description_en: "<p>Built APIs</p>",
          skills: [{ skill_name: "Node.js" }],
        },
      ],
    });

    const importResponse = await request(app)
      .post("/experiences/import")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Accept-Language", "en")
      .set("Cookie", [cookie])
      .attach("file", payload, {
        filename: "experiences-import.json",
        contentType: JSON_CONTENT_TYPE,
      });

    expect(importResponse.status).toBe(200);
    expect(importResponse.body.message).toBe("Experience imported successfully");
    expect(importResponse.body.data.map((item: { role_id: string }) => item.role_id)).toEqual([
      "Senior Frontend Developer",
      "Backend Developer",
    ]);
    expect(importResponse.body.data[0].description_id).toContain("<p>Halo</p>");
    expect(importResponse.body.data[0].description_id).not.toContain("<script");
    expect(importResponse.body.data[0].description_en).toContain("<p>Hello</p>");
    expect(importResponse.body.data[0].description_en).not.toContain("onerror");

    const listResponse = await request(app)
      .get("/experiences")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie]);

    expect(listResponse.status).toBe(200);
    expect(
      listResponse.body.data.map((item: { role_id: string }) => item.role_id),
    ).toEqual(["Legacy Role", "Senior Frontend Developer", "Backend Developer"]);
    expect(
      listResponse.body.data.map((item: { sort: number }) => item.sort),
    ).toEqual([1, 2, 3]);
    expect(
      listResponse.body.data[1].skills.map((item: { skill_name: string }) => item.skill_name),
    ).toEqual(["TypeScript", "Vue.js"]);
    expect(
      listResponse.body.data[2].skills.map((item: { skill_name: string }) => item.skill_name),
    ).toEqual(["Node.js"]);
  });

  it("import mengembalikan 400 jika file json tidak valid", async () => {
    const { cookie } = await createAccessTokenCookie();

    const response = await request(app)
      .post("/experiences/import")
      .set("Accept", JSON_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .attach("file", Buffer.from("{ invalid json"), {
        filename: "experiences-invalid.json",
        contentType: JSON_CONTENT_TYPE,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain("File JSON experience tidak valid");
  });
});
