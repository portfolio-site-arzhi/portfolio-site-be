import { z } from "zod";

const dateSchema = (fieldName: string) =>
  z.string().regex(/^\d{4}-\d{2}-01$/, `${fieldName} harus format YYYY-MM-01`);

const educationBaseSchema = z.object({
  institution_name: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree (id) is required"),
  degree_en: z.string().min(1, "Degree (en) is required"),
  field_of_study: z.string().min(1, "Field of study (id) is required"),
  field_of_study_en: z.string().min(1, "Field of study (en) is required"),
  start_date: dateSchema("start_date"),
  end_date: dateSchema("end_date").nullable().optional(),
  description: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const createEducationSchema = educationBaseSchema;

export const updateEducationSchema = educationBaseSchema.partial();

export const listEducationsQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const educationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateEducationSortSchema = z
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

export const landingEducationsQuerySchema = z.object({});

export type CreateEducationInputHttp = z.infer<typeof createEducationSchema>;
export type UpdateEducationInputHttp = z.infer<typeof updateEducationSchema>;
export type ListEducationsQueryInputHttp = z.infer<typeof listEducationsQuerySchema>;
export type UpdateEducationSortInputHttp = z.infer<typeof updateEducationSortSchema>;
export type LandingEducationsQueryInputHttp = z.infer<typeof landingEducationsQuerySchema>;

export const validateCreateEducation = (data: unknown): CreateEducationInputHttp =>
  createEducationSchema.parse(data);

export const validateUpdateEducation = (data: unknown): UpdateEducationInputHttp =>
  updateEducationSchema.parse(data);

export const validateListEducationsQuery = (
  query: unknown,
): ListEducationsQueryInputHttp => listEducationsQuerySchema.parse(query);

export const validateEducationIdParam = (params: unknown): number => {
  const parsed = educationIdParamSchema.parse(params);
  return parsed.id;
};

export const validateUpdateEducationSort = (
  data: unknown,
): UpdateEducationSortInputHttp => updateEducationSortSchema.parse(data);

export const validateLandingEducationsQuery = (
  query: unknown,
): LandingEducationsQueryInputHttp => landingEducationsQuerySchema.parse(query);
