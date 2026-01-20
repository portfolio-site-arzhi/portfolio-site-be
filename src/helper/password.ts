import crypto from "crypto";
import bcrypt from "bcrypt";

const defaultSaltRounds = 10;

export const hashPassword = async (plain: string, saltRounds?: number) => {
  const rounds = typeof saltRounds === "number" && saltRounds > 0 ? saltRounds : defaultSaltRounds;
  return bcrypt.hash(plain, rounds);
};

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
};

export const generateSystemPasswordPlain = (): string => {
  const fromEnv = process.env.SYSTEM_USER_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD;
  if (typeof fromEnv === "string" && fromEnv.length >= 8) {
    return fromEnv;
  }

  return crypto.randomBytes(32).toString("hex");
};

export const hashSystemPassword = async (saltRounds?: number): Promise<string> => {
  return hashPassword(generateSystemPasswordPlain(), saltRounds);
};
