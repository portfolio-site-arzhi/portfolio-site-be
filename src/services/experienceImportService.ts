import path from "path";
import type { ExperienceImportUploadFile } from "../model";

const normalizeUtf8Text = (buffer: Buffer): string => {
  const text = buffer.toString("utf-8");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
};

export class ExperienceImportService {
  parseImportFile(file: ExperienceImportUploadFile): unknown {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== ".json") {
      throw new Error("EXPERIENCE_IMPORT_INVALID_FILE");
    }

    try {
      return JSON.parse(normalizeUtf8Text(file.buffer)) as unknown;
    } catch {
      throw new Error("EXPERIENCE_IMPORT_INVALID_JSON_FILE");
    }
  }
}
