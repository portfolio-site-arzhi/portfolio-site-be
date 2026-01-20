import { getPrisma } from "../../src/config";

export const resetDatabase = async () => {
  const prisma = getPrisma();

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "users", "refresh_tokens" RESTART IDENTITY CASCADE;`,
  );
};
