import type { ExperienceImportUploadFile } from "../model";
import { parseUploadedJsonFile } from "../helper/jsonImport";

export class ExperienceImportService {
  parseImportFile(file: ExperienceImportUploadFile): unknown {
    return parseUploadedJsonFile(file, {
      invalidFileError: "EXPERIENCE_IMPORT_INVALID_FILE",
      invalidJsonError: "EXPERIENCE_IMPORT_INVALID_JSON_FILE",
    });
  }
}
