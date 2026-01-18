import { getPrisma } from "../../src/config";

export const resetDatabase = async () => {
  const prisma = getPrisma();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
};
