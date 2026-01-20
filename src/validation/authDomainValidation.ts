import { verifyPassword } from "../helper/password";
import jwt from "jsonwebtoken";
import type { User, RefreshToken } from "../model";
import { getJwtSecret } from "../config/jwt";

export const validateAccessTokenUserId = (token: string): number => {
  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded || typeof decoded !== "object") {
      throw new Error("INVALID_TOKEN");
    }

    const sub = (decoded as { sub?: unknown }).sub;

    if (typeof sub === "number" && Number.isFinite(sub)) {
      return sub;
    }

    if (typeof sub === "string") {
      const parsed = Number(sub);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    throw new Error("INVALID_TOKEN");
  } catch {
    throw new Error("INVALID_TOKEN");
  }
};

export const validateLoginUser = async (
  user: User | null,
  password: string,
): Promise<User> => {
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const activeUser = validateActiveUser(user);

  const passwordOk = await verifyPassword(password, activeUser.password);
  if (!passwordOk) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return activeUser;
};

export const validateActiveUser = (user: User): User => {
  if (!user.status) {
    throw new Error("USER_INACTIVE");
  }

  return user;
};

export const validateUserExists = (user: User | null): User => {
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return user;
};

export const validateRefreshTokenExists = (
  refreshToken: RefreshToken | null,
): RefreshToken => {
  if (!refreshToken) {
    throw new Error("REFRESH_TOKEN_INVALID");
  }
  return refreshToken;
};
