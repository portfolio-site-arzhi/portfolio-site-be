import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { getExperienceSuccessMessage } from "../i18n/experienceSuccessMessages";
import type { ExperienceSuccessMessageKey } from "../model";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { resolveResponseLocale } from "../helper/responseLocale";
import { ExperienceService } from "../services/experienceService";
import {
  validateCreateExperience,
  validateExperienceIdParam,
  validateListExperiencesQuery,
  validateUpdateExperience,
  validateUpdateExperienceSort,
} from "../validation/experienceValidation";

const formatDateOnly = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

const parseMonthDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

const getLocalizedExperienceSuccessMessage = (
  req: Request,
  key: ExperienceSuccessMessageKey,
): string => {
  const locale = resolveResponseLocale(req.headers["accept-language"]);
  return getExperienceSuccessMessage(locale, key);
};

export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  list = async (req: Request, res: Response) => {
    try {
      const query = validateListExperiencesQuery(req.query);
      const experiences = await this.experienceService.listExperiences({
        ...(typeof query.search === "string" ? { search: query.search } : {}),
      });

      res.status(200).json({
        data: experiences.map((experience) => ({
          id: experience.id,
          sort: experience.sort,
          is_published: experience.is_published,
          role_id: experience.role_id,
          role_en: experience.role_en,
          company_name: experience.company_name,
          company_url: experience.company_url,
          start_date: formatDateOnly(experience.start_date),
          end_date: formatDateOnly(experience.end_date),
          is_current: experience.is_current,
          description_id: experience.description_id,
          description_en: experience.description_en,
          skills: experience.skills.map((skill) => ({
            id: skill.id,
            skill_name: skill.skill_name,
            sort: skill.sort,
          })),
          created_at: experience.created_at,
          updated_at: experience.updated_at,
        })),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List experiences error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = validateExperienceIdParam(req.params);
      const experience = await this.experienceService.getExperienceById(id);

      res.status(200).json({
        data: {
          id: experience.id,
          sort: experience.sort,
          is_published: experience.is_published,
          role_id: experience.role_id,
          role_en: experience.role_en,
          company_name: experience.company_name,
          company_url: experience.company_url,
          start_date: formatDateOnly(experience.start_date),
          end_date: formatDateOnly(experience.end_date),
          is_current: experience.is_current,
          description_id: experience.description_id,
          description_en: experience.description_en,
          skills: experience.skills.map((skill) => ({
            id: skill.id,
            skill_name: skill.skill_name,
            sort: skill.sort,
          })),
          created_at: experience.created_at,
          updated_at: experience.updated_at,
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
          EXPERIENCE_NOT_FOUND: {
            status: 404,
            messages: ["Experience tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Get experience detail error");
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const input = validateCreateExperience(req.body);
      const experience = await this.experienceService.createExperience({
        isPublished: input.is_published,
        roleId: input.role_id,
        roleEn: input.role_en,
        companyName: input.company_name,
        companyUrl: input.company_url ?? null,
        startDate: typeof input.start_date === "string" ? parseMonthDate(input.start_date) : null,
        endDate: typeof input.end_date === "string" ? parseMonthDate(input.end_date) : null,
        isCurrent: input.is_current,
        descriptionId: input.description_id,
        descriptionEn: input.description_en,
        skills: input.skills.map((skill) => ({ skillName: skill.skill_name })),
      });

      res.status(201).json({
        message: getLocalizedExperienceSuccessMessage(req, "EXPERIENCE_CREATED_SUCCESS"),
        data: {
          id: experience.id,
          sort: experience.sort,
          is_published: experience.is_published,
          role_id: experience.role_id,
          role_en: experience.role_en,
          company_name: experience.company_name,
          company_url: experience.company_url,
          start_date: formatDateOnly(experience.start_date),
          end_date: formatDateOnly(experience.end_date),
          is_current: experience.is_current,
          description_id: experience.description_id,
          description_en: experience.description_en,
          skills: experience.skills.map((skill) => ({
            id: skill.id,
            skill_name: skill.skill_name,
            sort: skill.sort,
          })),
          created_at: experience.created_at,
          updated_at: experience.updated_at,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Create experience error");
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = validateExperienceIdParam(req.params);
      const input = validateUpdateExperience(req.body);
      const experience = await this.experienceService.updateExperience(id, {
        ...(typeof input.is_published === "boolean" ? { isPublished: input.is_published } : {}),
        ...(typeof input.role_id === "string" ? { roleId: input.role_id } : {}),
        ...(typeof input.role_en === "string" ? { roleEn: input.role_en } : {}),
        ...(typeof input.company_name === "string" ? { companyName: input.company_name } : {}),
        ...(typeof input.company_url !== "undefined" ? { companyUrl: input.company_url ?? null } : {}),
        ...(typeof input.start_date !== "undefined"
          ? { startDate: input.start_date === null ? null : parseMonthDate(input.start_date) }
          : {}),
        ...(typeof input.end_date !== "undefined"
          ? { endDate: input.end_date === null ? null : parseMonthDate(input.end_date) }
          : {}),
        ...(typeof input.is_current === "boolean" ? { isCurrent: input.is_current } : {}),
        ...(typeof input.description_id === "string" ? { descriptionId: input.description_id } : {}),
        ...(typeof input.description_en === "string" ? { descriptionEn: input.description_en } : {}),
        ...(Array.isArray(input.skills)
          ? { skills: input.skills.map((skill) => ({ skillName: skill.skill_name })) }
          : {}),
      });

      res.status(200).json({
        message: getLocalizedExperienceSuccessMessage(req, "EXPERIENCE_UPDATED_SUCCESS"),
        data: {
          id: experience.id,
          sort: experience.sort,
          is_published: experience.is_published,
          role_id: experience.role_id,
          role_en: experience.role_en,
          company_name: experience.company_name,
          company_url: experience.company_url,
          start_date: formatDateOnly(experience.start_date),
          end_date: formatDateOnly(experience.end_date),
          is_current: experience.is_current,
          description_id: experience.description_id,
          description_en: experience.description_en,
          skills: experience.skills.map((skill) => ({
            id: skill.id,
            skill_name: skill.skill_name,
            sort: skill.sort,
          })),
          created_at: experience.created_at,
          updated_at: experience.updated_at,
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
          EXPERIENCE_NOT_FOUND: {
            status: 404,
            messages: ["Experience tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update experience error");
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = validateExperienceIdParam(req.params);
      await this.experienceService.deleteExperience(id);

      res.status(200).json({
        message: getLocalizedExperienceSuccessMessage(req, "EXPERIENCE_DELETED_SUCCESS"),
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
          EXPERIENCE_NOT_FOUND: {
            status: 404,
            messages: ["Experience tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Delete experience error");
    }
  };

  updateSort = async (req: Request, res: Response) => {
    try {
      const input = validateUpdateExperienceSort(req.body);
      await this.experienceService.updateExperienceSort(input.ids);

      res.status(200).json({
        message: getLocalizedExperienceSuccessMessage(
          req,
          "EXPERIENCE_SORT_UPDATED_SUCCESS",
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
          EXPERIENCE_NOT_FOUND: {
            status: 404,
            messages: ["Experience tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update experience sort error");
    }
  };
}
