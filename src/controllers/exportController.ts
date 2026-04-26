import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { handleUnexpectedError, handleZodError } from "../helper/errorHandler";
import { CvPdfExportService } from "../services/cvPdfExportService";
import { PortfolioPdfExportService } from "../services/portfolioPdfExportService";
import { validatePdfExportQuery } from "../validation/exportValidation";

const sendPdf = (
  res: Response,
  params: {
    filename: string;
    buffer: Buffer;
  },
): void => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${params.filename}\"`);
  res.status(200).send(params.buffer);
};

export class ExportController {
  constructor(
    private readonly cvPdfExportService: CvPdfExportService,
    private readonly portfolioPdfExportService: PortfolioPdfExportService,
  ) {}

  exportCv = async (req: Request, res: Response) => {
    try {
      const query = validatePdfExportQuery(req.query);
      const file = await this.cvPdfExportService.exportPdf(query.locale);
      sendPdf(res, file);
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
      sendPdf(res, file);
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Export portfolio PDF error");
    }
  };
}
