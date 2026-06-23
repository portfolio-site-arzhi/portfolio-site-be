import type { PortfolioImportUploadFile } from "../model";
import { parseUploadedJsonFile } from "../helper/jsonImport";

export class PortfolioImportService {
  parseImportFile(file: PortfolioImportUploadFile): unknown {
    return parseUploadedJsonFile(file, {
      invalidFileError: "PORTFOLIO_IMPORT_INVALID_FILE",
      invalidJsonError: "PORTFOLIO_IMPORT_INVALID_JSON_FILE",
    });
  }
}
