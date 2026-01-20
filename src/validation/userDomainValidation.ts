import type { User } from "../model";

type PrismaErrorWithCode = { code: string };

const isPrismaErrorWithCode = (error: unknown): error is PrismaErrorWithCode => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code !== "string") {
    return false;
  }

  return true;
};

export const isUserNotFoundPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2025";
};

export const isUserAlreadyExistsPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2002";
};

export const validateUserEmailAvailable = (existing: User | null) => {
  if (existing) {
    throw new Error("USER_ALREADY_EXISTS");
  }
};

export const validateUserExists = (user: User | null): User => {
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return user;
};

export const validateUserDeleted = (deletedCount: number) => {
  if (deletedCount === 0) {
    throw new Error("USER_NOT_FOUND");
  }
};
