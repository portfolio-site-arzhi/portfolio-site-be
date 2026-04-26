import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { PortfolioLandingService } from "../services/portfolioLandingService";
import {
  validateLandingPortfoliosQuery,
  validatePortfolioSlugParam,
} from "../validation/portfolioValidation";

export class PortfolioLandingController {
  constructor(private readonly portfolioLandingService: PortfolioLandingService) {}

  list = async (req: Request, res: Response) => {
    try {
      validateLandingPortfoliosQuery(req.query);
      const data = await this.portfolioLandingService.listPublished();

      res.status(200).json({
        data,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List landing portfolios error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const slug = validatePortfolioSlugParam(req.params);
      const data = await this.portfolioLandingService.getPublishedBySlug(slug);

      res.status(200).json({
        data,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          PORTFOLIO_NOT_FOUND: {
            status: 404,
            messages: ["Portfolio tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Get landing portfolio detail error");
    }
  };
}
