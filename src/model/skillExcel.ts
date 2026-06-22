export interface SkillSpreadsheetExportResult {
  filename: string;
  buffer: Buffer;
}

export interface SkillImportWorksheetGroupRow {
  code: string;
  name: string;
}

export interface SkillImportWorksheetItemRow {
  group_code: string;
  name: string;
}

export interface SkillImportWorkbook {
  skill_groups: SkillImportWorksheetGroupRow[];
  skills: SkillImportWorksheetItemRow[];
}
