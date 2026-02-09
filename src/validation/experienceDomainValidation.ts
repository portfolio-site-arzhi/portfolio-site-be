import type { Experience, PrismaErrorWithCode } from "../model";

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

export const isExperienceNotFoundPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2025";
};

export const throwExperienceNotFoundIfPrismaError = (error: unknown): void => {
  if (isExperienceNotFoundPrismaError(error)) {
    throw new Error("EXPERIENCE_NOT_FOUND");
  }
};

export const validateExperienceExists = (experience: Experience | null): Experience => {
  if (!experience) {
    throw new Error("EXPERIENCE_NOT_FOUND");
  }
  return experience;
};

export const validateExperienceDeleted = (deletedCount: number) => {
  if (deletedCount === 0) {
    throw new Error("EXPERIENCE_NOT_FOUND");
  }
};
