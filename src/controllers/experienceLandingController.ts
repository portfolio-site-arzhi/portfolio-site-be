import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { handleUnexpectedError, handleZodError } from "../helper/errorHandler";
import { ExperienceLandingService } from "../services/experienceLandingService";

export class ExperienceLandingController {
  constructor(private readonly experienceLandingService: ExperienceLandingService) {}

  list = async (req: Request, res: Response) => {
    try {
      const data = await this.experienceLandingService.listPublished();
      res.status(200).json({ data });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List landing experiences error");
    }
  };
}
