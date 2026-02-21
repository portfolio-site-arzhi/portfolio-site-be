import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { handleUnexpectedError, handleZodError } from "../helper/errorHandler";
import { SkillLandingService } from "../services/skillLandingService";
import { validateLandingSkillsQuery } from "../validation/skillValidation";

export class SkillLandingController {
  constructor(private readonly skillLandingService: SkillLandingService) {}

  list = async (req: Request, res: Response) => {
    try {
      validateLandingSkillsQuery(req.query);
      const data = await this.skillLandingService.listActive();

      res.status(200).json({
        data,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List landing skills error");
    }
  };
}
