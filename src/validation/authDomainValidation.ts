import { verifyPassword } from "../helper/password";
import type { User, RefreshToken } from "../model";

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
