import { z, ZodError } from "zod";

const systemValueSchema = z.object({
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
});

const localizedTextSchema = z.object({
  id: z.string().min(1, "Text (id) is required"),
  en: z.string().min(1, "Text (en) is required"),
});

const homeValueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  description: localizedTextSchema,
  photo: z.string().url().optional(),
});

const aboutValueSchema = z.object({
  about_me: localizedTextSchema,
  email: z.string().email("Invalid email format"),
  address: z.preprocess(
    (value) => value ?? "",
    z.string().min(1, "Address is required"),
  ),
  whatsapp: z
    .string()
    .trim()
    .regex(
      /^8[0-9]{8,11}$/,
      "WhatsApp harus diawali 8, terdiri dari 9-12 digit, tanpa awalan 0, 62, atau +62",
    )
    .optional(),
});

const footerValueSchema = z.object({
  github: z.string().url("Invalid URL format").optional(),
  linkedin: z.string().url("Invalid URL format").optional(),
  instagram: z.string().url("Invalid URL format").optional(),
});

const bulkHomeSchema = z.object({
  status_file: z.union([z.literal(0), z.literal(1)]).optional(),
  value: homeValueSchema.optional(),
});

const bulkAboutSchema = z.object({
  value: aboutValueSchema.optional(),
});

const bulkFooterSchema = z.object({
  value: footerValueSchema.optional(),
});

const bulkSiteConfigSchema = z.object({
  system: systemValueSchema.optional(),
  home: bulkHomeSchema.optional(),
  about: bulkAboutSchema.optional(),
  footer: bulkFooterSchema.optional(),
});

export type BulkSiteConfigInput = z.infer<typeof bulkSiteConfigSchema>;

export const validateBulkSiteConfig = (data: unknown) =>
  bulkSiteConfigSchema.parse(data);

export const validateSiteConfigFileUpload = (params: {
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
      path: ["home_photo"],
    },
  ]);
};
