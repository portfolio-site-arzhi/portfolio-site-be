import { z } from "zod";
import { normalizeSkillImportRelationCode } from "../helper/skillImportCode";
import type { SkillImportWorkbook } from "../model";

const skillItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name maksimal 100 karakter"),
});

const skillBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name maksimal 100 karakter"),
  is_active: z.boolean().optional().default(true),
  skills: z.array(skillItemSchema).optional().default([]),
});

export const createSkillSchema = skillBaseSchema;

export const updateSkillSchema = skillBaseSchema
  .partial()
  .extend({
    skills: z.array(skillItemSchema).optional(),
  });

const rawSkillImportCodeSchema = z
  .string()
  .min(1, "Code is required")
  .max(100, "Code maksimal 100 karakter")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Code hanya boleh berisi huruf, angka, strip, atau underscore",
  );

const skillImportCodeSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    return normalizeSkillImportRelationCode(value.trim());
  }

  return value;
}, rawSkillImportCodeSchema);

const importSkillGroupWorkbookRowSchema = z.object({
  code: skillImportCodeSchema,
  name: z.string().min(1, "Name is required").max(100, "Name maksimal 100 karakter"),
});

const importSkillItemWorkbookRowSchema = z.object({
  group_code: skillImportCodeSchema,
  name: z.string().min(1, "Name is required").max(100, "Name maksimal 100 karakter"),
});

const importSkillWorkbookSchema = z
  .object({
    skill_groups: z
      .array(importSkillGroupWorkbookRowSchema)
      .min(1, "Sheet skill_groups tidak boleh kosong"),
    skills: z.array(importSkillItemWorkbookRowSchema),
  })
  .superRefine((data, ctx) => {
    const codes = new Set<string>();

    data.skill_groups.forEach((skillGroup, index) => {
      if (codes.has(skillGroup.code)) {
        ctx.addIssue({
          code: "custom",
          message: "Code skill group tidak boleh duplikat",
          path: ["skill_groups", index, "code"],
        });
        return;
      }

      codes.add(skillGroup.code);
    });

    data.skills.forEach((skillItem, index) => {
      if (!codes.has(skillItem.group_code)) {
        ctx.addIssue({
          code: "custom",
          message: "group_code tidak ditemukan pada sheet skill_groups",
          path: ["skills", index, "group_code"],
        });
      }
    });
  });

const skillImportFileUploadSchema = z
  .object({
    fileValidationError: z.string().optional(),
    hasFile: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.fileValidationError === "string" && data.fileValidationError) {
      ctx.addIssue({
        code: "custom",
        message: data.fileValidationError,
        path: ["file"],
      });
      return;
    }

    if (!data.hasFile) {
      ctx.addIssue({
        code: "custom",
        message: "File Excel wajib diupload",
        path: ["file"],
      });
    }
  });

export const listSkillsQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const skillIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateSkillSortSchema = z
  .object({
    ids: z.array(z.coerce.number().int().positive()).min(1),
  })
  .superRefine((data, ctx) => {
    const unique = new Set(data.ids);
    if (unique.size !== data.ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "ids tidak boleh duplikat",
        path: ["ids"],
      });
    }
  });

export const landingSkillsQuerySchema = z.object({});

export type CreateSkillInputHttp = z.infer<typeof createSkillSchema>;
export type UpdateSkillInputHttp = z.infer<typeof updateSkillSchema>;
export type ImportSkillWorkbookInputHttp = z.infer<typeof importSkillWorkbookSchema>;
export type ListSkillsQueryInputHttp = z.infer<typeof listSkillsQuerySchema>;
export type UpdateSkillSortInputHttp = z.infer<typeof updateSkillSortSchema>;
export type LandingSkillsQueryInputHttp = z.infer<typeof landingSkillsQuerySchema>;

export const validateCreateSkill = (data: unknown): CreateSkillInputHttp =>
  createSkillSchema.parse(data);

export const validateUpdateSkill = (data: unknown): UpdateSkillInputHttp =>
  updateSkillSchema.parse(data);

export const validateImportSkillWorkbook = (
  data: SkillImportWorkbook,
): ImportSkillWorkbookInputHttp => importSkillWorkbookSchema.parse(data);

export const validateSkillImportFileUpload = (data: unknown): void => {
  skillImportFileUploadSchema.parse(data);
};

export const validateListSkillsQuery = (query: unknown): ListSkillsQueryInputHttp =>
  listSkillsQuerySchema.parse(query);

export const validateSkillIdParam = (params: unknown): number => {
  const parsed = skillIdParamSchema.parse(params);
  return parsed.id;
};

export const validateUpdateSkillSort = (data: unknown): UpdateSkillSortInputHttp =>
  updateSkillSortSchema.parse(data);

export const validateLandingSkillsQuery = (query: unknown): LandingSkillsQueryInputHttp =>
  landingSkillsQuerySchema.parse(query);
