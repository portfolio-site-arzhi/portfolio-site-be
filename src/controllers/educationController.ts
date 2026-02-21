import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { EducationService } from "../services/educationService";
import {
  validateCreateEducation,
  validateEducationIdParam,
  validateListEducationsQuery,
  validateUpdateEducation,
  validateUpdateEducationSort,
} from "../validation/educationValidation";

const formatDateOnly = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

const parseDateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  list = async (req: Request, res: Response) => {
    try {
      const query = validateListEducationsQuery(req.query);
      const educations = await this.educationService.listEducations({
        ...(typeof query.search === "string" ? { search: query.search } : {}),
      });

      res.status(200).json({
        data: educations.map((education) => ({
          id: education.id,
          institution_name: education.institution_name,
          degree: education.degree,
          degree_en: education.degree_en,
          field_of_study: education.field_of_study,
          field_of_study_en: education.field_of_study_en,
          start_date: formatDateOnly(education.start_date),
          end_date: formatDateOnly(education.end_date),
          description: education.description,
          description_en: education.description_en,
          location: education.location,
          sort_order: education.sort_order,
          is_active: education.is_active,
          created_at: education.created_at,
          updated_at: education.updated_at,
        })),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List educations error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = validateEducationIdParam(req.params);
      const education = await this.educationService.getEducationById(id);

      res.status(200).json({
        data: {
          id: education.id,
          institution_name: education.institution_name,
          degree: education.degree,
          degree_en: education.degree_en,
          field_of_study: education.field_of_study,
          field_of_study_en: education.field_of_study_en,
          start_date: formatDateOnly(education.start_date),
          end_date: formatDateOnly(education.end_date),
          description: education.description,
          description_en: education.description_en,
          location: education.location,
          sort_order: education.sort_order,
          is_active: education.is_active,
          created_at: education.created_at,
          updated_at: education.updated_at,
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
          EDUCATION_NOT_FOUND: {
            status: 404,
            messages: ["Education tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Get education detail error");
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const input = validateCreateEducation(req.body);
      const education = await this.educationService.createEducation({
        institutionName: input.institution_name,
        degree: input.degree,
        degreeEn: input.degree_en,
        fieldOfStudy: input.field_of_study,
        fieldOfStudyEn: input.field_of_study_en,
        startDate: parseDateOnly(input.start_date),
        endDate: typeof input.end_date === "string" ? parseDateOnly(input.end_date) : null,
        description: typeof input.description === "string" ? input.description : null,
        descriptionEn: typeof input.description_en === "string" ? input.description_en : null,
        location: typeof input.location === "string" ? input.location : null,
        isActive: input.is_active,
      });

      res.status(201).json({
        data: {
          id: education.id,
          institution_name: education.institution_name,
          degree: education.degree,
          degree_en: education.degree_en,
          field_of_study: education.field_of_study,
          field_of_study_en: education.field_of_study_en,
          start_date: formatDateOnly(education.start_date),
          end_date: formatDateOnly(education.end_date),
          description: education.description,
          description_en: education.description_en,
          location: education.location,
          sort_order: education.sort_order,
          is_active: education.is_active,
          created_at: education.created_at,
          updated_at: education.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Create education error");
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = validateEducationIdParam(req.params);
      const input = validateUpdateEducation(req.body);
      const education = await this.educationService.updateEducation(id, {
        ...(typeof input.institution_name === "string"
          ? { institutionName: input.institution_name }
          : {}),
        ...(typeof input.degree === "string" ? { degree: input.degree } : {}),
        ...(typeof input.degree_en === "string" ? { degreeEn: input.degree_en } : {}),
        ...(typeof input.field_of_study === "string"
          ? { fieldOfStudy: input.field_of_study }
          : {}),
        ...(typeof input.field_of_study_en === "string"
          ? { fieldOfStudyEn: input.field_of_study_en }
          : {}),
        ...(typeof input.start_date === "string"
          ? { startDate: parseDateOnly(input.start_date) }
          : {}),
        ...(typeof input.end_date !== "undefined"
          ? {
              endDate:
                input.end_date === null ? null : parseDateOnly(input.end_date),
            }
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
        ...(typeof input.location !== "undefined"
          ? { location: input.location === null ? null : input.location }
          : {}),
        ...(typeof input.is_active === "boolean" ? { isActive: input.is_active } : {}),
      });

      res.status(200).json({
        data: {
          id: education.id,
          institution_name: education.institution_name,
          degree: education.degree,
          degree_en: education.degree_en,
          field_of_study: education.field_of_study,
          field_of_study_en: education.field_of_study_en,
          start_date: formatDateOnly(education.start_date),
          end_date: formatDateOnly(education.end_date),
          description: education.description,
          description_en: education.description_en,
          location: education.location,
          sort_order: education.sort_order,
          is_active: education.is_active,
          created_at: education.created_at,
          updated_at: education.updated_at,
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
          EDUCATION_NOT_FOUND: {
            status: 404,
            messages: ["Education tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update education error");
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = validateEducationIdParam(req.params);
      await this.educationService.deleteEducation(id);

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
          EDUCATION_NOT_FOUND: {
            status: 404,
            messages: ["Education tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Delete education error");
    }
  };

  updateSort = async (req: Request, res: Response) => {
    try {
      const input = validateUpdateEducationSort(req.body);
      await this.educationService.updateEducationSort(input.ids);

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
          EDUCATION_NOT_FOUND: {
            status: 404,
            messages: ["Education tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update education sort error");
    }
  };
}

