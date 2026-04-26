import { z } from "zod";
import type { PdfExportQuery } from "../model";

const exportQuerySchema = z.object({
  locale: z.enum(["id", "en"]).optional(),
});

export const validatePdfExportQuery = (query: unknown): PdfExportQuery => {
  const parsed = exportQuerySchema.parse(query);

  return {
    locale: parsed.locale ?? "en",
  };
};
