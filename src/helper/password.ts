import bcrypt from "bcrypt";

const defaultSaltRounds = 10;

export const hashPassword = async (plain: string, saltRounds?: number) => {
  const rounds = typeof saltRounds === "number" && saltRounds > 0 ? saltRounds : defaultSaltRounds;
  return bcrypt.hash(plain, rounds);
};

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};

