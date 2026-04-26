import type { ResponseLocale } from "./locale";

export interface PdfExportQuery {
  locale: ResponseLocale;
}

export interface PdfExportResult {
  filename: string;
  buffer: Buffer;
}
