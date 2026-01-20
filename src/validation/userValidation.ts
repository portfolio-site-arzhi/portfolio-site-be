import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  status: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1),
});

export const updateUserStatusSchema = z.object({
  status: z.boolean(),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateUserInputHttp = z.infer<typeof createUserSchema>;
export type UpdateUserInputHttp = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInputHttp = z.infer<typeof updateUserStatusSchema>;

export const validateCreateUser = (data: unknown): CreateUserInputHttp => {
  return createUserSchema.parse(data);
};

export const validateUpdateUser = (data: unknown): UpdateUserInputHttp => {
  return updateUserSchema.parse(data);
};

export const validateUpdateUserStatus = (
  data: unknown,
): UpdateUserStatusInputHttp => {
  return updateUserStatusSchema.parse(data);
};

export const validateUserIdParam = (params: unknown): number => {
  const parsed = userIdParamSchema.parse(params);
  return parsed.id;
};

