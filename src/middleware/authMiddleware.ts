import type { RequestHandler } from "express";
import { logger } from "../config";
import {
  handleDomainError,
  handleUnexpectedError,
} from "../helper/errorHandler";
import { PrismaRefreshTokenRepository } from "../repository/refreshTokenRepository";
import { PrismaUserRepository } from "../repository/userRepository";
import { AuthService } from "../services/authService";
import { validateAuthCookie } from "../validation/authValidation";

export const createRequireAuthMiddleware = (): RequestHandler => {
  const authService = new AuthService(
    new PrismaUserRepository(),
    new PrismaRefreshTokenRepository(),
  );

  return async (req, res, next) => {
    try {
      const token = validateAuthCookie(req.cookies);
      await authService.getUserFromAccessToken(token);
      next();
    } catch (error) {
      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          TOKEN_MISSING: {
            status: 401,
            messages: ["Token akses tidak ditemukan"],
          },
          INVALID_TOKEN: {
            status: 401,
            messages: ["Token akses tidak valid"],
          },
          USER_NOT_FOUND: {
            status: 401,
            messages: ["Pengguna tidak ditemukan"],
          },
          USER_INACTIVE: {
            status: 403,
            messages: ["Akun tidak aktif"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(
        res,
        error,
        logger,
        "Auth middleware error",
      );
    }
  };
};
