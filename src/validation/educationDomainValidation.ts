import type { Education, PrismaErrorWithCode } from "../model";

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

export const isEducationNotFoundPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2025";
};

export const throwEducationNotFoundIfPrismaError = (error: unknown): void => {
  if (isEducationNotFoundPrismaError(error)) {
    throw new Error("EDUCATION_NOT_FOUND");
  }
};

export const validateEducationExists = (education: Education | null): Education => {
  if (!education) {
    throw new Error("EDUCATION_NOT_FOUND");
  }
  return education;
};

export const validateEducationDeleted = (deletedCount: number) => {
  if (deletedCount === 0) {
    throw new Error("EDUCATION_NOT_FOUND");
  }
};

