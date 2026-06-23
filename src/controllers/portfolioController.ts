import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { ZodError } from "zod";
import { logger } from "../config";
import { getPortfolioSuccessMessage } from "../i18n/portfolioSuccessMessages";
import type {
  PortfolioCreatePayloadInput,
  PortfolioCreateServiceInput,
  PortfolioSuccessMessageKey,
} from "../model";
import {
  sendAttachmentBuffer,
} from "../helper/attachmentResponse";
import {
  handleDomainError,
  handleJsonSyntaxError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { withBaseUrl } from "../helper/publicUrl";
import { resolveResponseLocale } from "../helper/responseLocale";
import { PortfolioImportSampleService } from "../services/portfolioImportSampleService";
import { PortfolioImportService } from "../services/portfolioImportService";
import { PortfolioService } from "../services/portfolioService";
import {
  validateCreatePortfolio,
  validateCreatePortfolioFileUpload,
  validateImportPortfolio,
  validateListPortfoliosQuery,
  validatePortfolioIdParam,
  validatePortfolioImportFileUpload,
  validateUpdatePortfolio,
  validateUpdatePortfolioFileUpload,
  validateUpdatePortfolioSort,
} from "../validation/portfolioValidation";

const formatDateTime = (value: Date | null): string | null => (value ? value.toISOString() : null);

const parseDatetime = (value: string): Date => new Date(value);

const getMultipartPayload = (body: unknown): unknown => {
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as { payload?: unknown }).payload === "string" &&
    (body as { payload: string }).payload
  ) {
    return JSON.parse((body as { payload: string }).payload);
  }

  return body;
};

const getUploadedImageFilename = (req: Request): string | undefined => {
  const file = req.file;
  return typeof file?.filename === "string" ? file.filename : undefined;
};

const getPortfolioImagePath = (filename: string): string =>
  `/uploads/portfolio/${filename}`;

const removeUploadedPortfolioImage = (filename: string | undefined): void => {
  if (!filename) {
    return;
  }

  const fullPath = path.join(process.cwd(), "uploads", "portfolio", filename);

  try {
    fs.unlinkSync(fullPath);
  } catch {
    return;
  }
};

const getLocalizedPortfolioSuccessMessage = (
  req: Request,
  key: PortfolioSuccessMessageKey,
): string => {
  const locale = resolveResponseLocale(req.headers["accept-language"]);
  return getPortfolioSuccessMessage(locale, key);
};

const mapPortfolioInputToService = (
  input: PortfolioCreatePayloadInput,
  image: string | null,
): PortfolioCreateServiceInput => ({
  title: input.title,
  description: input.description,
  descriptionEn: input.description_en ?? null,
  contribution: input.contribution ?? null,
  contributionEn: input.contribution_en ?? null,
  outcome: input.outcome ?? null,
  outcomeEn: input.outcome_en ?? null,
  image,
  role: input.role ?? null,
  liveUrl: input.live_url ?? null,
  githubUrl: input.github_url ?? null,
  isPublished: input.is_published,
  publishedAt:
    typeof input.published_at === "string" ? parseDatetime(input.published_at) : null,
  stacks: input.stacks.map((stack) => ({
    name: stack.name,
  })),
});

const mapPortfolioResponse = (portfolio: Awaited<ReturnType<PortfolioService["getPortfolioById"]>>) => ({
  id: portfolio.id,
  slug: portfolio.slug,
  title: portfolio.title,
  description: portfolio.description,
  description_en: portfolio.description_en,
  contribution: portfolio.contribution,
  contribution_en: portfolio.contribution_en,
  outcome: portfolio.outcome,
  outcome_en: portfolio.outcome_en,
  image: withBaseUrl(portfolio.image),
  role: portfolio.role,
  live_url: portfolio.live_url,
  github_url: portfolio.github_url,
  display_order: portfolio.display_order,
  is_published: portfolio.is_published,
  published_at: formatDateTime(portfolio.published_at),
  stacks: portfolio.stacks.map((stack) => ({
    id: stack.id,
    portfolio_id: stack.portfolio_id,
    name: stack.name,
    display_order: stack.display_order,
    created_at: stack.created_at,
    updated_at: stack.updated_at,
  })),
  created_at: portfolio.created_at,
  updated_at: portfolio.updated_at,
});

export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly portfolioImportService: PortfolioImportService,
    private readonly portfolioImportSampleService: PortfolioImportSampleService,
  ) {}

  list = async (req: Request, res: Response) => {
    try {
      const query = validateListPortfoliosQuery(req.query);
      const portfolios = await this.portfolioService.listPortfolios({
        ...(typeof query.search === "string" ? { search: query.search } : {}),
      });

      res.status(200).json({
        data: portfolios.map((portfolio) => mapPortfolioResponse(portfolio)),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List portfolios error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = validatePortfolioIdParam(req.params);
      const portfolio = await this.portfolioService.getPortfolioById(id);

      res.status(200).json({
        data: mapPortfolioResponse(portfolio),
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

      handleUnexpectedError(res, error, logger, "Get portfolio detail error");
    }
  };

  create = async (req: Request, res: Response) => {
    let uploadedImageFilename: string | undefined;

    try {
      const fileValidationError =
        (req as Request & { fileValidationError?: string }).fileValidationError ??
        undefined;
      uploadedImageFilename = getUploadedImageFilename(req);
      const validatedImageFilename = validateCreatePortfolioFileUpload({
        fileValidationError,
        filename: uploadedImageFilename,
      });

      const input = validateCreatePortfolio(getMultipartPayload(req.body));
      const portfolio = await this.portfolioService.createPortfolio(
        mapPortfolioInputToService(
          input,
          typeof validatedImageFilename === "string"
            ? getPortfolioImagePath(validatedImageFilename)
            : null,
        ),
      );

      res.status(201).json({
        message: getLocalizedPortfolioSuccessMessage(req, "PORTFOLIO_CREATED_SUCCESS"),
        data: mapPortfolioResponse(portfolio),
      });
    } catch (error) {
      removeUploadedPortfolioImage(uploadedImageFilename);

      if (handleJsonSyntaxError(res, error)) {
        return;
      }

      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          PORTFOLIO_SLUG_ALREADY_EXISTS: {
            status: 400,
            messages: ["Slug portfolio sudah digunakan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Create portfolio error");
    }
  };

  import = async (req: Request, res: Response) => {
    try {
      const fileValidationError =
        (req as Request & { fileValidationError?: string }).fileValidationError ??
        undefined;
      const uploadedFile = req.file;
      validatePortfolioImportFileUpload({
        ...(typeof fileValidationError === "string" ? { fileValidationError } : {}),
        hasFile: Boolean(uploadedFile),
      });

      if (!uploadedFile) {
        return;
      }

      const rows = this.portfolioImportService.parseImportFile({
        buffer: uploadedFile.buffer,
        originalname: uploadedFile.originalname,
      });
      const input = validateImportPortfolio(rows);
      const portfolios = await this.portfolioService.importPortfolios({
        portfolios: input.portfolios.map((portfolio) =>
          mapPortfolioInputToService(portfolio, null),
        ),
      });

      res.status(200).json({
        message: getLocalizedPortfolioSuccessMessage(req, "PORTFOLIO_IMPORTED_SUCCESS"),
        data: portfolios.map((portfolio) => mapPortfolioResponse(portfolio)),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          PORTFOLIO_IMPORT_INVALID_FILE: {
            status: 400,
            messages: ["File import portfolio tidak valid"],
          },
          PORTFOLIO_IMPORT_INVALID_JSON_FILE: {
            status: 400,
            messages: ["File JSON portfolio tidak valid"],
          },
          PORTFOLIO_SLUG_ALREADY_EXISTS: {
            status: 400,
            messages: ["Slug portfolio sudah digunakan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Import portfolio error");
    }
  };

  sampleImport = async (_req: Request, res: Response) => {
    try {
      const file = this.portfolioImportSampleService.createSampleFile();
      sendAttachmentBuffer(res, file);
    } catch (error) {
      handleUnexpectedError(
        res,
        error,
        logger,
        "Download portfolio import sample error",
      );
    }
  };

  update = async (req: Request, res: Response) => {
    let uploadedImageFilename: string | undefined;

    try {
      const id = validatePortfolioIdParam(req.params);
      const fileValidationError =
        (req as Request & { fileValidationError?: string }).fileValidationError ??
        undefined;
      uploadedImageFilename = getUploadedImageFilename(req);
      validateUpdatePortfolioFileUpload({ fileValidationError });

      const input = validateUpdatePortfolio(getMultipartPayload(req.body));
      const image =
        input.status_file === 1
          ? uploadedImageFilename
            ? getPortfolioImagePath(uploadedImageFilename)
            : null
          : undefined;

      if (input.status_file === 0) {
        removeUploadedPortfolioImage(uploadedImageFilename);
        uploadedImageFilename = undefined;
      }

      const portfolio = await this.portfolioService.updatePortfolio(id, {
        ...(typeof input.title === "string" ? { title: input.title } : {}),
        ...(typeof input.description === "string" ? { description: input.description } : {}),
        ...(typeof input.description_en !== "undefined"
          ? { descriptionEn: input.description_en ?? null }
          : {}),
        ...(typeof input.contribution !== "undefined"
          ? { contribution: input.contribution ?? null }
          : {}),
        ...(typeof input.contribution_en !== "undefined"
          ? { contributionEn: input.contribution_en ?? null }
          : {}),
        ...(typeof input.outcome !== "undefined" ? { outcome: input.outcome ?? null } : {}),
        ...(typeof input.outcome_en !== "undefined"
          ? { outcomeEn: input.outcome_en ?? null }
          : {}),
        ...(typeof image !== "undefined" ? { image } : {}),
        ...(typeof input.role !== "undefined" ? { role: input.role ?? null } : {}),
        ...(typeof input.live_url !== "undefined" ? { liveUrl: input.live_url ?? null } : {}),
        ...(typeof input.github_url !== "undefined"
          ? { githubUrl: input.github_url ?? null }
          : {}),
        ...(typeof input.is_published === "boolean"
          ? { isPublished: input.is_published }
          : {}),
        ...(typeof input.published_at !== "undefined"
          ? {
              publishedAt:
                typeof input.published_at === "string"
                  ? parseDatetime(input.published_at)
                  : null,
            }
          : {}),
        ...(Array.isArray(input.stacks)
          ? {
              stacks: input.stacks.map((stack) => ({
                name: stack.name,
              })),
            }
          : {}),
      });

      res.status(200).json({
        message: getLocalizedPortfolioSuccessMessage(req, "PORTFOLIO_UPDATED_SUCCESS"),
        data: mapPortfolioResponse(portfolio),
      });
    } catch (error) {
      removeUploadedPortfolioImage(uploadedImageFilename);

      if (handleJsonSyntaxError(res, error)) {
        return;
      }

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
          PORTFOLIO_SLUG_ALREADY_EXISTS: {
            status: 400,
            messages: ["Slug portfolio sudah digunakan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update portfolio error");
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = validatePortfolioIdParam(req.params);
      await this.portfolioService.deletePortfolio(id);

      res.status(200).json({
        message: getLocalizedPortfolioSuccessMessage(req, "PORTFOLIO_DELETED_SUCCESS"),
        data: true,
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

      handleUnexpectedError(res, error, logger, "Delete portfolio error");
    }
  };

  updateSort = async (req: Request, res: Response) => {
    try {
      const input = validateUpdatePortfolioSort(req.body);
      await this.portfolioService.updatePortfolioSort(input.ids);

      res.status(200).json({
        message: getLocalizedPortfolioSuccessMessage(
          req,
          "PORTFOLIO_SORT_UPDATED_SUCCESS",
        ),
        data: true,
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

      handleUnexpectedError(res, error, logger, "Update portfolio sort error");
    }
  };
}
