import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { sendAttachmentBuffer } from "../helper/attachmentResponse";
import { handleUnexpectedError, handleZodError } from "../helper/errorHandler";
import { CvPdfExportService } from "../services/cvPdfExportService";
import { PortfolioPdfExportService } from "../services/portfolioPdfExportService";
import { validatePdfExportQuery } from "../validation/exportValidation";

export class ExportController {
  constructor(
    private readonly cvPdfExportService: CvPdfExportService,
    private readonly portfolioPdfExportService: PortfolioPdfExportService,
  ) {}

  exportCv = async (req: Request, res: Response) => {
    try {
      const query = validatePdfExportQuery(req.query);
      const file = await this.cvPdfExportService.exportPdf(query.locale);
      sendAttachmentBuffer(res, {
        filename: file.filename,
        buffer: file.buffer,
        contentType: "application/pdf",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Export CV PDF error");
    }
  };

  exportPortfolios = async (req: Request, res: Response) => {
    try {
      const query = validatePdfExportQuery(req.query);
      const file = await this.portfolioPdfExportService.exportPdf(query.locale);
      sendAttachmentBuffer(res, {
        filename: file.filename,
        buffer: file.buffer,
        contentType: "application/pdf",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Export portfolio PDF error");
    }
  };
}
