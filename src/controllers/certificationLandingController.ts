import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { handleUnexpectedError, handleZodError } from "../helper/errorHandler";
import { CertificationLandingService } from "../services/certificationLandingService";
import { validateLandingCertificationsQuery } from "../validation/certificationValidation";

export class CertificationLandingController {
  constructor(
    private readonly certificationLandingService: CertificationLandingService,
  ) {}

  list = async (req: Request, res: Response) => {
    try {
      validateLandingCertificationsQuery(req.query);
      const data = await this.certificationLandingService.listActive();
      res.status(200).json({ data });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List landing certifications error");
    }
  };
}

