import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { CertificationService } from "../services/certificationService";
import {
  validateCertificationIdParam,
  validateCreateCertification,
  validateListCertificationsQuery,
  validateUpdateCertification,
  validateUpdateCertificationSort,
} from "../validation/certificationValidation";

const formatDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

const parseDateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  list = async (req: Request, res: Response) => {
    try {
      const query = validateListCertificationsQuery(req.query);
      const certifications = await this.certificationService.listCertifications({
        ...(typeof query.search === "string" ? { search: query.search } : {}),
      });

      res.status(200).json({
        data: certifications.map((certification) => ({
          id: certification.id,
          name: certification.name,
          name_en: certification.name_en,
          issuing_organization: certification.issuing_organization,
          issue_date: formatDateOnly(certification.issue_date),
          description: certification.description,
          description_en: certification.description_en,
          sort_order: certification.sort_order,
          is_active: certification.is_active,
          created_at: certification.created_at,
          updated_at: certification.updated_at,
        })),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List certifications error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = validateCertificationIdParam(req.params);
      const certification = await this.certificationService.getCertificationById(id);

      res.status(200).json({
        data: {
          id: certification.id,
          name: certification.name,
          name_en: certification.name_en,
          issuing_organization: certification.issuing_organization,
          issue_date: formatDateOnly(certification.issue_date),
          description: certification.description,
          description_en: certification.description_en,
          sort_order: certification.sort_order,
          is_active: certification.is_active,
          created_at: certification.created_at,
          updated_at: certification.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          CERTIFICATION_NOT_FOUND: {
            status: 404,
            messages: ["Certification tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Get certification detail error");
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const input = validateCreateCertification(req.body);
      const certification = await this.certificationService.createCertification({
        name: input.name,
        nameEn: input.name_en,
        issuingOrganization: input.issuing_organization,
        issueDate: parseDateOnly(input.issue_date),
        description: typeof input.description === "string" ? input.description : null,
        descriptionEn: typeof input.description_en === "string" ? input.description_en : null,
        isActive: input.is_active,
      });

      res.status(201).json({
        data: {
          id: certification.id,
          name: certification.name,
          name_en: certification.name_en,
          issuing_organization: certification.issuing_organization,
          issue_date: formatDateOnly(certification.issue_date),
          description: certification.description,
          description_en: certification.description_en,
          sort_order: certification.sort_order,
          is_active: certification.is_active,
          created_at: certification.created_at,
          updated_at: certification.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Create certification error");
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = validateCertificationIdParam(req.params);
      const input = validateUpdateCertification(req.body);
      const certification = await this.certificationService.updateCertification(id, {
        ...(typeof input.name === "string" ? { name: input.name } : {}),
        ...(typeof input.name_en === "string" ? { nameEn: input.name_en } : {}),
        ...(typeof input.issuing_organization === "string"
          ? { issuingOrganization: input.issuing_organization }
          : {}),
        ...(typeof input.issue_date === "string"
          ? { issueDate: parseDateOnly(input.issue_date) }
          : {}),
        ...(typeof input.description !== "undefined"
          ? { description: input.description === null ? null : input.description }
          : {}),
        ...(typeof input.description_en !== "undefined"
          ? {
              descriptionEn:
                input.description_en === null ? null : input.description_en,
            }
          : {}),
        ...(typeof input.is_active === "boolean" ? { isActive: input.is_active } : {}),
      });

      res.status(200).json({
        data: {
          id: certification.id,
          name: certification.name,
          name_en: certification.name_en,
          issuing_organization: certification.issuing_organization,
          issue_date: formatDateOnly(certification.issue_date),
          description: certification.description,
          description_en: certification.description_en,
          sort_order: certification.sort_order,
          is_active: certification.is_active,
          created_at: certification.created_at,
          updated_at: certification.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          CERTIFICATION_NOT_FOUND: {
            status: 404,
            messages: ["Certification tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update certification error");
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = validateCertificationIdParam(req.params);
      await this.certificationService.deleteCertification(id);

      res.status(200).json({
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
          CERTIFICATION_NOT_FOUND: {
            status: 404,
            messages: ["Certification tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Delete certification error");
    }
  };

  updateSort = async (req: Request, res: Response) => {
    try {
      const input = validateUpdateCertificationSort(req.body);
      await this.certificationService.updateCertificationSort(input.ids);

      res.status(200).json({
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
          CERTIFICATION_NOT_FOUND: {
            status: 404,
            messages: ["Certification tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update certification sort error");
    }
  };
}

