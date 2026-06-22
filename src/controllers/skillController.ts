import type { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config";
import { getSkillSuccessMessage } from "../i18n/skillSuccessMessages";
import type { SkillSuccessMessageKey } from "../model";
import { sendAttachmentBuffer } from "../helper/attachmentResponse";
import {
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { resolveResponseLocale } from "../helper/responseLocale";
import { toSkillResponse } from "../helper/skillResponse";
import { SkillExcelService } from "../services/skillExcelService";
import { SkillService } from "../services/skillService";
import {
  validateCreateSkill,
  validateImportSkillWorkbook,
  validateListSkillsQuery,
  validateSkillImportFileUpload,
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
  constructor(
    private readonly skillService: SkillService,
    private readonly skillExcelService: SkillExcelService,
  ) {}

  list = async (req: Request, res: Response) => {
    try {
      const query = validateListSkillsQuery(req.query);
      const skills = await this.skillService.listSkills({
        ...(typeof query.search === "string" ? { search: query.search } : {}),
      });

      res.status(200).json({
        data: skills.map(toSkillResponse),
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
        data: toSkillResponse(skill),
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
        data: toSkillResponse(skill),
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
        data: toSkillResponse(skill),
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

  import = async (req: Request, res: Response) => {
    try {
      const fileValidationError =
        (req as Request & { fileValidationError?: string }).fileValidationError ??
        undefined;
      const uploadedFile = req.file;
      validateSkillImportFileUpload({
        ...(typeof fileValidationError === "string" ? { fileValidationError } : {}),
        hasFile: Boolean(uploadedFile),
      });

      if (!uploadedFile) {
        return;
      }

      const rows = await this.skillExcelService.parseImportFile(uploadedFile.buffer);
      const input = validateImportSkillWorkbook(rows);
      const skillItemsByGroupCode = new Map<string, { name: string }[]>();

      input.skills.forEach((skillItem) => {
        const items = skillItemsByGroupCode.get(skillItem.group_code) ?? [];
        items.push({ name: skillItem.name });
        skillItemsByGroupCode.set(skillItem.group_code, items);
      });

      const skills = await this.skillService.importSkills({
        skillGroups: input.skill_groups.map((skillGroup) => ({
          name: skillGroup.name,
          skills: skillItemsByGroupCode.get(skillGroup.code) ?? [],
        })),
      });

      res.status(200).json({
        message: getLocalizedSkillSuccessMessage(req, "SKILL_IMPORTED_SUCCESS"),
        data: skills.map(toSkillResponse),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          SKILL_IMPORT_INVALID_FILE: {
            status: 400,
            messages: ["File Excel skill tidak valid"],
          },
          SKILL_IMPORT_GROUPS_WORKSHEET_NOT_FOUND: {
            status: 400,
            messages: ["Worksheet skill_groups tidak ditemukan di file Excel"],
          },
          SKILL_IMPORT_SKILLS_WORKSHEET_NOT_FOUND: {
            status: 400,
            messages: ["Worksheet skills tidak ditemukan di file Excel"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Import skill error");
    }
  };

  export = async (_req: Request, res: Response) => {
    try {
      const skills = await this.skillService.listSkills();
      const file = await this.skillExcelService.exportSkills(skills);
      sendAttachmentBuffer(res, {
        filename: file.filename,
        buffer: file.buffer,
        contentType: this.skillExcelService.getContentType(),
      });
    } catch (error) {
      handleUnexpectedError(res, error, logger, "Export skill error");
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
