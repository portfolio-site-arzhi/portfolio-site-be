import ExcelJS from "exceljs";
import request from "supertest";
import { app } from "../../../src";
import { createAccessTokenCookie } from "../../utils/auth";
import { resetDatabase } from "../../utils/db";

const EXCEL_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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

const createSkillImportWorkbook = async (params: {
  skill_groups: Array<{
    code: string;
    name: string;
  }>;
  skills: Array<{
    group_code: string;
    name: string;
  }>;
}): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const skillGroupsWorksheet = workbook.addWorksheet("skill_groups");
  const skillsWorksheet = workbook.addWorksheet("skills");

  skillGroupsWorksheet.columns = [
    { header: "code", key: "code" },
    { header: "name", key: "name" },
  ];
  skillsWorksheet.columns = [
    { header: "group_code", key: "group_code" },
    { header: "name", key: "name" },
  ];

  skillGroupsWorksheet.addRows(params.skill_groups);
  skillsWorksheet.addRows(params.skills);

  const result = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(result) ? result : Buffer.from(result);
};

describe("GET /skills/export dan POST /skills/import", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("endpoint import dan export skill mengembalikan 401 jika belum login", async () => {
    const exportResponse = await request(app)
      .get("/skills/export")
      .set("Accept", "application/json");

    expect(exportResponse.status).toBe(401);

    const importResponse = await request(app)
      .post("/skills/import")
      .set("Accept", "application/json");

    expect(importResponse.status).toBe(401);
  });

  it("export mengembalikan file excel dengan 2 sheet: skill_groups dan skills", async () => {
    const { cookie } = await createAccessTokenCookie();

    await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Frontend",
        is_active: true,
        skills: [{ name: "Vue.js" }, { name: "TypeScript" }],
      });

    await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Tools",
        is_active: false,
        skills: [{ name: "Git" }],
      });

    const response = await request(app)
      .get("/skills/export")
      .set("Accept", EXCEL_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .buffer(true)
      .parse(binaryParser);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain(EXCEL_CONTENT_TYPE);
    expect(response.headers["content-disposition"]).toContain("attachment");
    expect(response.headers["content-disposition"]).toContain("skills-export.xlsx");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.body as Buffer);

    expect(workbook.worksheets.map((worksheet) => worksheet.name)).toEqual([
      "skill_groups",
      "skills",
    ]);

    const skillGroupsWorksheet = workbook.getWorksheet("skill_groups");
    expect(skillGroupsWorksheet).toBeDefined();
    expect(skillGroupsWorksheet?.getRow(2).getCell(1).value).toBe("frontend");
    expect(skillGroupsWorksheet?.getRow(2).getCell(2).value).toBe("Frontend");
    expect(skillGroupsWorksheet?.getRow(3).getCell(1).value).toBe("tools");
    expect(skillGroupsWorksheet?.getRow(3).getCell(2).value).toBe("Tools");

    const skillsWorksheet = workbook.getWorksheet("skills");
    expect(skillsWorksheet).toBeDefined();
    expect(skillsWorksheet?.getRow(2).getCell(1).value).toBe("frontend");
    expect(skillsWorksheet?.getRow(2).getCell(2).value).toBe("Vue.js");
    expect(skillsWorksheet?.getRow(3).getCell(1).value).toBe("frontend");
    expect(skillsWorksheet?.getRow(3).getCell(2).value).toBe("TypeScript");
    expect(skillsWorksheet?.getRow(4).getCell(1).value).toBe("tools");
    expect(skillsWorksheet?.getRow(4).getCell(2).value).toBe("Git");
  });

  it("import dari excel hanya menambah data baru, relasi child pakai group_code, dan auto aktif", async () => {
    const { cookie } = await createAccessTokenCookie();

    await request(app)
      .post("/skills")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .send({
        name: "Legacy",
        is_active: true,
        skills: [{ name: "Old Skill" }],
      });

    const workbookBuffer = await createSkillImportWorkbook({
      skill_groups: [
        { code: "backend", name: "Backend" },
        { code: "devops_tools", name: "DevOps" },
      ],
      skills: [
        { group_code: "backend", name: "Node.js" },
        { group_code: "backend", name: "PostgreSQL" },
        { group_code: "devops_tools", name: "Docker" },
      ],
    });

    const importResponse = await request(app)
      .post("/skills/import")
      .set("Accept", "application/json")
      .set("Accept-Language", "en")
      .set("Cookie", [cookie])
      .attach("file", workbookBuffer, {
        filename: "skills-import.xlsx",
        contentType: EXCEL_CONTENT_TYPE,
      });

    expect(importResponse.status).toBe(200);
    expect(importResponse.body.message).toBe("Skill imported successfully");
    expect(importResponse.body.data.map((item: { name: string }) => item.name)).toEqual([
      "Backend",
      "DevOps",
    ]);
    expect(
      importResponse.body.data.map((item: { is_active: boolean }) => item.is_active),
    ).toEqual([true, true]);

    const listResponse = await request(app)
      .get("/skills")
      .set("Accept", "application/json")
      .set("Cookie", [cookie]);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.map((item: { name: string }) => item.name)).toEqual([
      "Legacy",
      "Backend",
      "DevOps",
    ]);
    expect(
      listResponse.body.data.map((item: { display_order: number }) => item.display_order),
    ).toEqual([1, 2, 3]);
    expect(
      listResponse.body.data[1].skills.map((item: { name: string }) => item.name),
    ).toEqual(["Node.js", "PostgreSQL"]);
    expect(
      listResponse.body.data[2].skills.map((item: { name: string }) => item.name),
    ).toEqual(["Docker"]);
  });

  it("import membersihkan spasi dan mengubah code serta group_code menjadi lowercase sebelum validasi relasi", async () => {
    const { cookie } = await createAccessTokenCookie();

    const workbookBuffer = await createSkillImportWorkbook({
      skill_groups: [{ code: " BACK_END ", name: "Backend" }],
      skills: [{ group_code: " back_END ", name: "Node.js" }],
    });

    const response = await request(app)
      .post("/skills/import")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .attach("file", workbookBuffer, {
        filename: "skills-trimmed.xlsx",
        contentType: EXCEL_CONTENT_TYPE,
      });

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toBe("Backend");
    expect(response.body.data[0].skills.map((item: { name: string }) => item.name)).toEqual([
      "Node.js",
    ]);

    const exportResponse = await request(app)
      .get("/skills/export")
      .set("Accept", EXCEL_CONTENT_TYPE)
      .set("Cookie", [cookie])
      .buffer(true)
      .parse(binaryParser);

    expect(exportResponse.status).toBe(200);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(exportResponse.body as Buffer);

    const skillGroupsWorksheet = workbook.getWorksheet("skill_groups");
    const skillsWorksheet = workbook.getWorksheet("skills");

    expect(skillGroupsWorksheet?.getRow(2).getCell(1).value).toBe("backend");
    expect(skillsWorksheet?.getRow(2).getCell(1).value).toBe("backend");
  });

  it("import mengembalikan 400 jika group_code child tidak punya parent skill_group", async () => {
    const { cookie } = await createAccessTokenCookie();

    const workbookBuffer = await createSkillImportWorkbook({
      skill_groups: [{ code: "frontend", name: "Frontend" }],
      skills: [{ group_code: "backend", name: "Node.js" }],
    });

    const response = await request(app)
      .post("/skills/import")
      .set("Accept", "application/json")
      .set("Cookie", [cookie])
      .attach("file", workbookBuffer, {
        filename: "skills-invalid.xlsx",
        contentType: EXCEL_CONTENT_TYPE,
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain(
      "group_code tidak ditemukan pada sheet skill_groups",
    );
  });
});
