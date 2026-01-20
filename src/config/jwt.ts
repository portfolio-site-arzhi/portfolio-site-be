import type { SignOptions } from "jsonwebtoken";

export const getJwtSecret = () => {
  const fromEnv = process.env.COOKIE_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  return "change_me_jwt_secret";
};

export const getJwtExpiresIn = (): SignOptions["expiresIn"] => {
  const value = process.env.JWT_EXPIRES_IN;
  if (!value) return "1h";
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return Math.floor(asNumber);
  }
  return value as unknown as SignOptions["expiresIn"];
};

