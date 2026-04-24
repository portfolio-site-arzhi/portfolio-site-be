import type { Request, Response } from "express";
import { ZodError } from "zod";
import { SiteConfigService } from "../services/siteConfigService";
import { SiteConfigLandingService } from "../services/siteConfigLandingService";
import { getSiteConfigSuccessMessage } from "../i18n/siteConfigSuccessMessages";
import type { SiteConfigSuccessMessageKey } from "../model";
import {
  validateBulkSiteConfig,
  validateSiteConfigFileUpload,
} from "../validation/siteConfigValidation";
import { logger } from "../config";
import {
  buildErrorResponse,
  handleJsonSyntaxError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { resolveResponseLocale } from "../helper/responseLocale";

const getLocalizedSiteConfigSuccessMessage = (
  req: Request,
  key: SiteConfigSuccessMessageKey,
): string => {
  const locale = resolveResponseLocale(req.headers["accept-language"]);
  return getSiteConfigSuccessMessage(locale, key);
};

export class SiteConfigController {
  constructor(
    private readonly siteConfigService: SiteConfigService,
    private readonly siteConfigLandingService: SiteConfigLandingService,
  ) {}

  list = async (req: Request, res: Response) => {
    try {
      const data = await this.siteConfigLandingService.getLandingPageData();

      res.status(200).json({
        data,
      });
    } catch (error) {
      handleUnexpectedError(res, error, logger, "List site configs error");
    }
  };

  bulkUpdate = async (req: Request, res: Response) => {
    try {
      const fileValidationError =
        (req as Request & { fileValidationError?: string }).fileValidationError ??
        undefined;
      validateSiteConfigFileUpload({ fileValidationError });

      const raw =
        typeof req.body?.payload === "string" && req.body.payload
          ? JSON.parse(req.body.payload)
          : req.body;

      const input = validateBulkSiteConfig(raw);

      const files = req.files as Record<string, unknown> | undefined;

      const getFile = (field: string) => {
        if (!files) return undefined;
        const entry = files[field];
        if (!Array.isArray(entry) || entry.length === 0) return undefined;
        const first = entry[0];
        if (!first || typeof first !== "object") return undefined;
        const filename = (first as { filename?: unknown }).filename;
        if (typeof filename !== "string") return undefined;
        return filename;
      };

      const homePhotoFilename = getFile("home_photo");

      await this.siteConfigService.bulkUpsertLandingConfigs(input, {
        homePhotoFilename,
      });

      const data = await this.siteConfigLandingService.getLandingPageData();

      res.status(200).json({
        message: getLocalizedSiteConfigSuccessMessage(
          req,
          "SITE_CONFIG_BULK_UPDATED_SUCCESS",
        ),
        data,
      });
    } catch (error) {
      if (handleJsonSyntaxError(res, error)) {
        return;
      }

      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Bulk update site config error");
    }
  };
}
