import type { Portfolio, PrismaErrorWithCode } from "../model";

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

export const isPortfolioNotFoundPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2025";
};

export const isPortfolioAlreadyExistsPrismaError = (
  error: unknown,
): error is PrismaErrorWithCode => {
  return isPrismaErrorWithCode(error) && error.code === "P2002";
};

export const throwPortfolioDomainErrorIfPrismaError = (error: unknown): void => {
  if (isPortfolioNotFoundPrismaError(error)) {
    throw new Error("PORTFOLIO_NOT_FOUND");
  }

  if (isPortfolioAlreadyExistsPrismaError(error)) {
    throw new Error("PORTFOLIO_SLUG_ALREADY_EXISTS");
  }
};

export const validatePortfolioExists = (portfolio: Portfolio | null): Portfolio => {
  if (!portfolio) {
    throw new Error("PORTFOLIO_NOT_FOUND");
  }

  return portfolio;
};

export const validatePortfolioDeleted = (deletedCount: number) => {
  if (deletedCount === 0) {
    throw new Error("PORTFOLIO_NOT_FOUND");
  }
};
