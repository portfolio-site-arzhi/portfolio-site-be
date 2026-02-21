import { z } from "zod";

const dateSchema = (fieldName: string) =>
  z.string().regex(/^\d{4}-\d{2}-01$/, `${fieldName} harus format YYYY-MM-01`);

const certificationBaseSchema = z.object({
  name: z.string().min(1, "Name (id) is required"),
  name_en: z.string().min(1, "Name (en) is required"),
  issuing_organization: z.string().min(1, "Issuing organization is required"),
  issue_date: dateSchema("issue_date"),
  description: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const createCertificationSchema = certificationBaseSchema;

export const updateCertificationSchema = certificationBaseSchema.partial();

export const listCertificationsQuerySchema = z.object({
  search: z.string().min(1).optional(),
});

export const certificationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateCertificationSortSchema = z
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

export const landingCertificationsQuerySchema = z.object({});

export type CreateCertificationInputHttp = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInputHttp = z.infer<typeof updateCertificationSchema>;
export type ListCertificationsQueryInputHttp = z.infer<typeof listCertificationsQuerySchema>;
export type UpdateCertificationSortInputHttp = z.infer<typeof updateCertificationSortSchema>;
export type LandingCertificationsQueryInputHttp = z.infer<typeof landingCertificationsQuerySchema>;

export const validateCreateCertification = (
  data: unknown,
): CreateCertificationInputHttp => createCertificationSchema.parse(data);

export const validateUpdateCertification = (
  data: unknown,
): UpdateCertificationInputHttp => updateCertificationSchema.parse(data);

export const validateListCertificationsQuery = (
  query: unknown,
): ListCertificationsQueryInputHttp => listCertificationsQuerySchema.parse(query);

export const validateCertificationIdParam = (params: unknown): number => {
  const parsed = certificationIdParamSchema.parse(params);
  return parsed.id;
};

export const validateUpdateCertificationSort = (
  data: unknown,
): UpdateCertificationSortInputHttp => updateCertificationSortSchema.parse(data);

export const validateLandingCertificationsQuery = (
  query: unknown,
): LandingCertificationsQueryInputHttp => landingCertificationsQuerySchema.parse(query);
