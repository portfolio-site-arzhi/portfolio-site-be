import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { getSkillSuccessMessage } from "../i18n/skillSuccessMessages";
import type { SkillSuccessMessageKey } from "../model";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { resolveResponseLocale } from "../helper/responseLocale";
import { SkillService } from "../services/skillService";
import {
  validateCreateSkill,
  validateListSkillsQuery,
  validateSkillIdParam,
  validateUpdateSkill,
  validateUpdateSkillSort,
} from "../validation/skillValidation";

const getLocalizedSkillSuccessMessage = (
  req: Request,
  key: SkillSuccessMessageKey,
): string => {
  const locale = resolveResponseLocale(req.headers["accept-language"]);
  return getSkillSuccessMessage(locale, key);
};

export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  list = async (req: Request, res: Response) => {
    try {
      const query = validateListSkillsQuery(req.query);
      const skills = await this.skillService.listSkills({
        ...(typeof query.search === "string" ? { search: query.search } : {}),
      });

      res.status(200).json({
        data: skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          display_order: skill.display_order,
          is_active: skill.is_active,
          created_at: skill.created_at,
          updated_at: skill.updated_at,
          skills: skill.skills.map((skillItem) => ({
            id: skillItem.id,
            skill_group_id: skillItem.skill_group_id,
            name: skillItem.name,
            display_order: skillItem.display_order,
            created_at: skillItem.created_at,
            updated_at: skillItem.updated_at,
          })),
        })),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "List skills error");
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = validateSkillIdParam(req.params);
      const skill = await this.skillService.getSkillById(id);

      res.status(200).json({
        data: {
          id: skill.id,
          name: skill.name,
          display_order: skill.display_order,
          is_active: skill.is_active,
          created_at: skill.created_at,
          updated_at: skill.updated_at,
          skills: skill.skills.map((skillItem) => ({
            id: skillItem.id,
            skill_group_id: skillItem.skill_group_id,
            name: skillItem.name,
            display_order: skillItem.display_order,
            created_at: skillItem.created_at,
            updated_at: skillItem.updated_at,
          })),
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
          SKILL_NOT_FOUND: {
            status: 404,
            messages: ["Skill tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Get skill detail error");
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const input = validateCreateSkill(req.body);
      const skill = await this.skillService.createSkill({
        name: input.name,
        isActive: input.is_active,
        skills: input.skills.map((skillItem) => ({ name: skillItem.name })),
      });

      res.status(201).json({
        message: getLocalizedSkillSuccessMessage(req, "SKILL_CREATED_SUCCESS"),
        data: {
          id: skill.id,
          name: skill.name,
          display_order: skill.display_order,
          is_active: skill.is_active,
          created_at: skill.created_at,
          updated_at: skill.updated_at,
          skills: skill.skills.map((skillItem) => ({
            id: skillItem.id,
            skill_group_id: skillItem.skill_group_id,
            name: skillItem.name,
            display_order: skillItem.display_order,
            created_at: skillItem.created_at,
            updated_at: skillItem.updated_at,
          })),
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      handleUnexpectedError(res, error, logger, "Create skill error");
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = validateSkillIdParam(req.params);
      const input = validateUpdateSkill(req.body);
      const skill = await this.skillService.updateSkill(id, {
        ...(typeof input.name === "string" ? { name: input.name } : {}),
        ...(typeof input.is_active === "boolean" ? { isActive: input.is_active } : {}),
        ...(Array.isArray(input.skills)
          ? { skills: input.skills.map((skillItem) => ({ name: skillItem.name })) }
          : {}),
      });

      res.status(200).json({
        message: getLocalizedSkillSuccessMessage(req, "SKILL_UPDATED_SUCCESS"),
        data: {
          id: skill.id,
          name: skill.name,
          display_order: skill.display_order,
          is_active: skill.is_active,
          created_at: skill.created_at,
          updated_at: skill.updated_at,
          skills: skill.skills.map((skillItem) => ({
            id: skillItem.id,
            skill_group_id: skillItem.skill_group_id,
            name: skillItem.name,
            display_order: skillItem.display_order,
            created_at: skillItem.created_at,
            updated_at: skillItem.updated_at,
          })),
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
          SKILL_NOT_FOUND: {
            status: 404,
            messages: ["Skill tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update skill error");
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = validateSkillIdParam(req.params);
      await this.skillService.deleteSkill(id);

      res.status(200).json({
        message: getLocalizedSkillSuccessMessage(req, "SKILL_DELETED_SUCCESS"),
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
          SKILL_NOT_FOUND: {
            status: 404,
            messages: ["Skill tidak ditemukan"],
          },
          SKILL_HAS_CHILDREN: {
            status: 400,
            messages: ["Skill masih memiliki child skills"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Delete skill error");
    }
  };

  updateSort = async (req: Request, res: Response) => {
    try {
      const input = validateUpdateSkillSort(req.body);
      await this.skillService.updateSkillSort(input.ids);

      res.status(200).json({
        message: getLocalizedSkillSuccessMessage(req, "SKILL_SORT_UPDATED_SUCCESS"),
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
          SKILL_NOT_FOUND: {
            status: 404,
            messages: ["Skill tidak ditemukan"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Update skill sort error");
    }
  };
}
