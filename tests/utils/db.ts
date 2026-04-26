import { getPrisma } from "../../src/config";

export const resetDatabase = async () => {
  const prisma = getPrisma();

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "users", "refresh_tokens", "site_configurations", "skill_groups", "skills", "experiences", "experiences_skills", "educations", "certifications", "portfolios", "portfolio_stacks" RESTART IDENTITY CASCADE;`,
  );
};
