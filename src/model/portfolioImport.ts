import type { JsonImportUploadFile } from "./jsonImport";
import type { PortfolioCreatePayloadInput } from "./portfolioInput";

export interface PortfolioImportItem extends PortfolioCreatePayloadInput {}

export interface PortfolioImportPayload {
  portfolios: PortfolioImportItem[];
}

export interface PortfolioImportUploadFile extends JsonImportUploadFile {}

export interface PortfolioImportSampleFile {
  filename: string;
  buffer: Buffer;
  contentType: string;
}
