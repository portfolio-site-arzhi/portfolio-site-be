import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const validateLogin = (data: unknown): LoginInput => {
  return loginSchema.parse(data);
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
