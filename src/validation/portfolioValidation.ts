import { z, ZodError } from "zod";

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const optionalNullableStringSchema = () =>
  z.preprocess(
    normalizeOptionalString,
    z.string().min(1).nullable().optional(),
  );

const optionalNullableUrlSchema = (fieldName: string) =>
  z.preprocess(
    normalizeOptionalString,
    z.string().url(`Invalid ${fieldName} format`).nullable().optional(),
  );

const optionalNullableDatetimeSchema = (fieldName: string) =>
  z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), `${fieldName} harus format datetime valid`)
      .nullable()
      .optional(),
  );

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(160, "Slug maksimal 160 karakter")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung");

const stackSchema = z.object({
  name: z.string().trim().min(1, "Stack name is required").max(120, "Stack name maksimal 120 karakter"),
});

const portfolioBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title maksimal 200 karakter"),
  description: z.string().trim().min(1, "Description is required"),
  description_en: optionalNullableStringSchema(),
  contribution: optionalNullableStringSchema(),
  contribution_en: optionalNullableStringSchema(),
  outcome: optionalNullableStringSchema(),
  outcome_en: optionalNullableStringSchema(),
  role: optionalNullableStringSchema(),
  live_url: optionalNullableUrlSchema("live URL"),
  github_url: optionalNullableUrlSchema("GitHub URL"),
  is_published: z.boolean().optional().default(false),
  published_at: optionalNullableDatetimeSchema("published_at"),
  stacks: z.array(stackSchema).optional().default([]),
});

export const createPortfolioSchema = portfolioBaseSchema;

export const updatePortfolioSchema = portfolioBaseSchema
  .partial()
  .extend({
    status_file: z.union([z.literal(0), z.literal(1)]),
    stacks: z.array(stackSchema).optional(),
  });

export const listPortfoliosQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
});

export const portfolioIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const portfolioSlugParamSchema = z.object({
  slug: slugSchema,
});

export const updatePortfolioSortSchema = z
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

export const landingPortfoliosQuerySchema = z.object({});

export type CreatePortfolioInputHttp = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInputHttp = z.infer<typeof updatePortfolioSchema>;
export type ListPortfoliosQueryInputHttp = z.infer<typeof listPortfoliosQuerySchema>;
export type UpdatePortfolioSortInputHttp = z.infer<typeof updatePortfolioSortSchema>;
export type LandingPortfoliosQueryInputHttp = z.infer<typeof landingPortfoliosQuerySchema>;

export const validateCreatePortfolio = (data: unknown): CreatePortfolioInputHttp =>
  createPortfolioSchema.parse(data);

export const validateUpdatePortfolio = (data: unknown): UpdatePortfolioInputHttp =>
  updatePortfolioSchema.parse(data);

export const validateListPortfoliosQuery = (
  query: unknown,
): ListPortfoliosQueryInputHttp => listPortfoliosQuerySchema.parse(query);

export const validatePortfolioIdParam = (params: unknown): number => {
  const parsed = portfolioIdParamSchema.parse(params);
  return parsed.id;
};

export const validatePortfolioSlugParam = (params: unknown): string => {
  const parsed = portfolioSlugParamSchema.parse(params);
  return parsed.slug;
};

export const validateUpdatePortfolioSort = (
  data: unknown,
): UpdatePortfolioSortInputHttp => updatePortfolioSortSchema.parse(data);

export const validateLandingPortfoliosQuery = (
  query: unknown,
): LandingPortfoliosQueryInputHttp => landingPortfoliosQuerySchema.parse(query);

export const validateCreatePortfolioFileUpload = (params: {
  fileValidationError: string | undefined;
  filename: string | undefined;
}): string | undefined => {
  const { fileValidationError, filename } = params;

  if (fileValidationError) {
    throw new ZodError([
      {
        code: "custom",
        message: fileValidationError,
        path: ["image"],
      },
    ]);
  }

  return filename;
};

export const validateUpdatePortfolioFileUpload = (params: {
  fileValidationError: string | undefined;
}): void => {
  const { fileValidationError } = params;

  if (!fileValidationError) {
    return;
  }

  throw new ZodError([
    {
      code: "custom",
      message: fileValidationError,
      path: ["image"],
    },
  ]);
};
