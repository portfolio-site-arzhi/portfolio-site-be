import type { PrismaErrorWithCode, Skill } from "../model";

const isPrismaErrorWithCode = (error: unknown): error is PrismaErrorWithCode => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string";
};

const isSkillNotFoundPrismaError = (error: unknown): error is PrismaErrorWithCode =>
  isPrismaErrorWithCode(error) && error.code === "P2025";

const isSkillHasChildrenPrismaError = (error: unknown): error is PrismaErrorWithCode =>
  isPrismaErrorWithCode(error) && error.code === "P2003";

export const throwSkillDomainErrorIfPrismaError = (error: unknown): void => {
  if (isSkillNotFoundPrismaError(error)) {
    throw new Error("SKILL_NOT_FOUND");
  }

  if (isSkillHasChildrenPrismaError(error)) {
    throw new Error("SKILL_HAS_CHILDREN");
  }
};

export const validateSkillExists = (skill: Skill | null): Skill => {
  if (!skill) {
    throw new Error("SKILL_NOT_FOUND");
  }

  return skill;
};

export const validateSkillDeleted = (deletedCount: number): void => {
  if (deletedCount === 0) {
    throw new Error("SKILL_NOT_FOUND");
  }
};
