import { z } from "zod";

const skillSchema = z.object({
  skill_name: z.string().min(1, "Skill name is required"),
});

const monthDateSchema = (fieldName: string) =>
  z.string().regex(/^\d{4}-\d{2}-01$/, `${fieldName} harus format YYYY-MM-01`);

const experienceBaseSchema = z.object({
  is_published: z.boolean().optional().default(false),
  role_id: z.string().min(1, "Role (id) is required"),
  role_en: z.string().min(1, "Role (en) is required"),
  company_name: z.string().min(1, "Company name is required"),
  company_url: z.string().url("Invalid company URL format").nullable().optional(),
  start_date: monthDateSchema("start_date").nullable().optional(),
  end_date: monthDateSchema("end_date").nullable().optional(),
  is_current: z.boolean().optional().default(false),
  description_id: z.string().min(1, "Description (id) is required"),
  description_en: z.string().min(1, "Description (en) is required"),
  skills: z.array(skillSchema).optional().default([]),
});

export const createExperienceSchema = experienceBaseSchema.superRefine((data, ctx) => {
  if (data.is_current && data.end_date !== null && typeof data.end_date !== "undefined") {
    ctx.addIssue({
      code: "custom",
      message: "end_date harus null jika is_current = true",
      path: ["end_date"],
    });
  }
});

export const updateExperienceSchema = experienceBaseSchema
  .partial()
  .extend({
    skills: z.array(skillSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_current === true && data.end_date !== null && typeof data.end_date !== "undefined") {
      ctx.addIssue({
        code: "custom",
        message: "end_date harus null jika is_current = true",
        path: ["end_date"],
      });
    }
  });

export const importExperienceSchema = z.object({
  experiences: z.array(createExperienceSchema).min(1, "Daftar experiences tidak boleh kosong"),
});

const experienceImportFileUploadSchema = z
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
        message: "File JSON wajib diupload",
        path: ["file"],
      });
    }
  });

export const listExperiencesQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const experienceIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateExperienceSortSchema = z
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

export const landingExperiencesQuerySchema = z.object({});

export type CreateExperienceInputHttp = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInputHttp = z.infer<typeof updateExperienceSchema>;
export type ImportExperienceInputHttp = z.infer<typeof importExperienceSchema>;
export type ListExperiencesQueryInputHttp = z.infer<typeof listExperiencesQuerySchema>;
export type UpdateExperienceSortInputHttp = z.infer<typeof updateExperienceSortSchema>;
export type LandingExperiencesQueryInputHttp = z.infer<typeof landingExperiencesQuerySchema>;

export const validateCreateExperience = (data: unknown): CreateExperienceInputHttp =>
  createExperienceSchema.parse(data);

export const validateUpdateExperience = (data: unknown): UpdateExperienceInputHttp =>
  updateExperienceSchema.parse(data);

export const validateImportExperience = (data: unknown): ImportExperienceInputHttp =>
  importExperienceSchema.parse(data);

export const validateExperienceImportFileUpload = (data: unknown): void => {
  experienceImportFileUploadSchema.parse(data);
};

export const validateListExperiencesQuery = (
  query: unknown,
): ListExperiencesQueryInputHttp => listExperiencesQuerySchema.parse(query);

export const validateExperienceIdParam = (params: unknown): number => {
  const parsed = experienceIdParamSchema.parse(params);
  return parsed.id;
};

export const validateUpdateExperienceSort = (
  data: unknown,
): UpdateExperienceSortInputHttp => updateExperienceSortSchema.parse(data);

export const validateLandingExperiencesQuery = (
  query: unknown,
): LandingExperiencesQueryInputHttp => landingExperiencesQuerySchema.parse(query);
