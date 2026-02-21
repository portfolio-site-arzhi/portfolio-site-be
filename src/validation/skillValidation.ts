import { z } from "zod";

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
export type ListSkillsQueryInputHttp = z.infer<typeof listSkillsQuerySchema>;
export type UpdateSkillSortInputHttp = z.infer<typeof updateSkillSortSchema>;
export type LandingSkillsQueryInputHttp = z.infer<typeof landingSkillsQuerySchema>;

export const validateCreateSkill = (data: unknown): CreateSkillInputHttp =>
  createSkillSchema.parse(data);

export const validateUpdateSkill = (data: unknown): UpdateSkillInputHttp =>
  updateSkillSchema.parse(data);

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
