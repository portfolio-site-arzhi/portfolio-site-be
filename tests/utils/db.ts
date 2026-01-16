import { getPrisma } from "../../src/config";

export const resetDatabase = async () => {
  const prisma = getPrisma();
  // Gunakan deleteMany untuk keamanan dan menghindari masalah lock/permissions pada TRUNCATE
  await prisma.user.deleteMany();
};

