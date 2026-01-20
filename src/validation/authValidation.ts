import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

const googleCallbackQuerySchema = z.object({
  code: z.string().min(1, "Kode otorisasi Google tidak ada"),
});

export type GoogleCallbackQueryInput = z.infer<typeof googleCallbackQuerySchema>;

export const validateLogin = (data: unknown): LoginInput => {
  return loginSchema.parse(data);
};

export const validateGoogleCallbackQuery = (
  query: unknown,
): GoogleCallbackQueryInput => {
  const codeValue =
    typeof query === "object" && query !== null
      ? (query as { code?: unknown }).code
      : undefined;

  let code = "";
  if (typeof codeValue === "string") {
    code = codeValue;
  } else if (Array.isArray(codeValue) && typeof codeValue[0] === "string") {
    code = codeValue[0];
  }

  return googleCallbackQuerySchema.parse({ code });
};

export const validateAuthCookie = (cookies: unknown): string => {
  const c = cookies as { access_token?: string } | undefined;
  if (!c?.access_token) {
    throw new Error("TOKEN_MISSING");
  }
  return c.access_token;
};

export const validateRefreshCookie = (cookies: unknown): string => {
  const c = cookies as { refresh_token?: string } | undefined;
  if (!c?.refresh_token) {
    throw new Error("REFRESH_TOKEN_MISSING");
  }
  return c.refresh_token;
};
