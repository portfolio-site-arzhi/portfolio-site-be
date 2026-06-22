import ExcelJS from "exceljs";
import { createSkillImportCode } from "../helper/skillImportCode";
import type {
  SkillImportWorkbook,
  SkillImportWorksheetGroupRow,
  SkillImportWorksheetItemRow,
  Skill,
  SkillSpreadsheetExportResult,
} from "../model";

const SKILL_GROUPS_WORKSHEET_NAME = "skill_groups";
const SKILLS_WORKSHEET_NAME = "skills";
const EXCEL_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const getExcelBuffer = async (workbook: ExcelJS.Workbook): Promise<Buffer> => {
  const result = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(result) ? result : Buffer.from(result);
};

const configureWorksheet = (
  worksheet: ExcelJS.Worksheet,
  columns: Array<{ header: string; key: string; width: number }>,
) => {
  worksheet.columns = columns;
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  const lastColumnLetter = String.fromCharCode(64 + columns.length);
  worksheet.autoFilter = `A1:${lastColumnLetter}1`;
};

const readWorksheetRows = <T>(
  worksheet: ExcelJS.Worksheet,
  mapRow: (row: ExcelJS.Row, rowNumber: number) => T | null,
): T[] => {
  const rows: T[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const mappedRow = mapRow(row, rowNumber);
    if (mappedRow) {
      rows.push(mappedRow);
    }
  });

  return rows;
};

const trimCellText = (row: ExcelJS.Row, columnNumber: number): string =>
  row.getCell(columnNumber).text.trim();

export class SkillExcelService {
  getContentType(): string {
    return EXCEL_CONTENT_TYPE;
  }

  async exportSkills(skills: Skill[]): Promise<SkillSpreadsheetExportResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "portfolio-site-be";
    workbook.created = new Date();

    const skillGroupsWorksheet = workbook.addWorksheet(SKILL_GROUPS_WORKSHEET_NAME);
    configureWorksheet(skillGroupsWorksheet, [
      { header: "code", key: "code", width: 28 },
      { header: "name", key: "name", width: 36 },
    ]);

    const skillsWorksheet = workbook.addWorksheet(SKILLS_WORKSHEET_NAME);
    configureWorksheet(skillsWorksheet, [
      { header: "group_code", key: "group_code", width: 28 },
      { header: "name", key: "name", width: 36 },
    ]);

    const usedCodes = new Set<string>();

    skills.forEach((skillGroup) => {
      const code = createSkillImportCode(skillGroup.name, usedCodes);

      skillGroupsWorksheet.addRow({
        code,
        name: skillGroup.name,
      });

      skillGroup.skills.forEach((skillItem) => {
        skillsWorksheet.addRow({
          group_code: code,
          name: skillItem.name,
        });
      });
    });

    return {
      filename: "skills-export.xlsx",
      buffer: await getExcelBuffer(workbook),
    };
  }

  async parseImportFile(buffer: Buffer): Promise<SkillImportWorkbook> {
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(
        buffer as unknown as Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0],
      );
    } catch {
      throw new Error("SKILL_IMPORT_INVALID_FILE");
    }

    const skillGroupsWorksheet = workbook.getWorksheet(SKILL_GROUPS_WORKSHEET_NAME);
    if (!skillGroupsWorksheet) {
      throw new Error("SKILL_IMPORT_GROUPS_WORKSHEET_NOT_FOUND");
    }

    const skillsWorksheet = workbook.getWorksheet(SKILLS_WORKSHEET_NAME);
    if (!skillsWorksheet) {
      throw new Error("SKILL_IMPORT_SKILLS_WORKSHEET_NOT_FOUND");
    }

    const skillGroups = readWorksheetRows<SkillImportWorksheetGroupRow>(
      skillGroupsWorksheet,
      (row) => {
        const code = trimCellText(row, 1);
        const name = trimCellText(row, 2);

        if (!code && !name) {
          return null;
        }

        return {
          code,
          name,
        };
      },
    );

    const skillItems = readWorksheetRows<SkillImportWorksheetItemRow>(
      skillsWorksheet,
      (row) => {
        const groupCode = trimCellText(row, 1);
        const name = trimCellText(row, 2);

        if (!groupCode && !name) {
          return null;
        }

        return {
          group_code: groupCode,
          name,
        };
      },
    );

    return {
      skill_groups: skillGroups,
      skills: skillItems,
    };
  }
}
