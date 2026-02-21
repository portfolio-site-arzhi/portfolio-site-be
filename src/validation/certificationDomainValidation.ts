import type { Certification, PrismaErrorWithCode } from "../model";

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

export const isCertificationNotFoundPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2025";
};

export const throwCertificationNotFoundIfPrismaError = (error: unknown): void => {
  if (isCertificationNotFoundPrismaError(error)) {
    throw new Error("CERTIFICATION_NOT_FOUND");
  }
};

export const validateCertificationExists = (
  certification: Certification | null,
): Certification => {
  if (!certification) {
    throw new Error("CERTIFICATION_NOT_FOUND");
  }
  return certification;
};

export const validateCertificationDeleted = (deletedCount: number) => {
  if (deletedCount === 0) {
    throw new Error("CERTIFICATION_NOT_FOUND");
  }
};

