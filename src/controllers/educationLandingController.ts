import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { handleUnexpectedError, handleZodError } from "../helper/errorHandler";
import { EducationLandingService } from "../services/educationLandingService";
import { validateLandingEducationsQuery } from "../validation/educationValidation";

export class EducationLandingController {
  constructor(private readonly educationLandingService: EducationLandingService) {}

  list = async (req: Request, res: Response) => {
    try {
      validateLandingEducationsQuery(req.query);
      const data = await this.educationLandingService.listActive();
      res.status(200).json({ data });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List landing educations error");
    }
  };
}

