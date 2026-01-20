import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthTokens } from "../model";
import { AuthService } from "../services/authService";
import {
  validateLogin,
  validateGoogleCallbackQuery,
  validateAuthCookie,
  validateRefreshCookie,
} from "../validation/authValidation";
import { validateLoginUser } from "../validation/authDomainValidation";
import {
  validateGoogleOAuthCallbackConfigFromEnv,
  validateGoogleOAuthRedirectConfigFromEnv,
  validateGoogleTokenResponse,
  validateGoogleUserInfo,
} from "../validation/googleOAuthValidation";
import { logger } from "../config";
import {
  buildErrorResponse,
  handleDomainError,
  handleUnexpectedError,
  handleZodError,
} from "../helper/errorHandler";
import { httpClient } from "../helper/httpClient";

const isProductionLike = process.env.NODE_ENV !== "development";
const refreshTokenMaxAgeMs = 365 * 24 * 60 * 60 * 1000;

const setAuthCookies = (res: Response, tokens: AuthTokens) => {
  res.cookie("access_token", tokens.accessToken, {
    httpOnly: true,
    secure: isProductionLike,
    sameSite: "lax",
    path: "/",
  });

  res.cookie("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure: isProductionLike,
    sameSite: "lax",
    path: "/",
    maxAge: refreshTokenMaxAgeMs,
  });
};

const setLoginStatusCookie = (res: Response, value: boolean) => {
  res.cookie("is_logged_in", value ? "true" : "false", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: refreshTokenMaxAgeMs,
  });
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    try {
      const input = validateLogin(req.body);
      const user = await this.authService.findUserByEmail(input.email);
      const validatedUser = await validateLoginUser(user, input.password);
      const result = await this.authService.loginWithUser(validatedUser);
      setAuthCookies(res, result.tokens);
      setLoginStatusCookie(res, true);
      res.status(200).json({
        access_token: result.tokens.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          status: result.user.status,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          INVALID_CREDENTIALS: {
            status: 401,
            messages: ["Email atau password salah"],
          },
          USER_INACTIVE: {
            status: 403,
            messages: ["Akun tidak aktif"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Login error");
    }
  };

  googleAuth = async (_req: Request, res: Response) => {
    try {
      const { clientId, redirectUri } =
        validateGoogleOAuthRedirectConfigFromEnv();

      const scope = [
        "openid",
        "email",
        "profile",
      ].join(" ");

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope,
        access_type: "offline",
        prompt: "consent",
      });

      const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      res.redirect(url);
    } catch (error) {
      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          GOOGLE_OAUTH_CONFIG_MISSING: {
            status: 500,
            messages: ["Konfigurasi Google OAuth belum lengkap"],
          },
        })
      ) {
        return;
      }

      handleUnexpectedError(res, error, logger, "Google auth redirect error");
    }
  };

  googleCallback = async (req: Request, res: Response) => {
    try {
      const { code } = validateGoogleCallbackQuery(req.query);
      const { clientId, clientSecret, redirectUri } =
        validateGoogleOAuthCallbackConfigFromEnv();

      const tokenResponse = await httpClient.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: () => true,
        },
      );

      if (tokenResponse.status < 200 || tokenResponse.status >= 300) {
        logger.error("Google token endpoint error", {
          status: tokenResponse.status,
        });
        throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
      }

      const token = validateGoogleTokenResponse(tokenResponse.data);

      const userInfoResponse = await httpClient.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
          validateStatus: () => true,
        },
      );

      if (userInfoResponse.status < 200 || userInfoResponse.status >= 300) {
        logger.error("Google userinfo endpoint error", {
          status: userInfoResponse.status,
        });
        throw new Error("GOOGLE_USERINFO_FAILED");
      }

      const profile = validateGoogleUserInfo(userInfoResponse.data);

      const result = await this.authService.loginWithGoogleProfile(profile);

      setAuthCookies(res, result.tokens);
      setLoginStatusCookie(res, true);

      const frontendUrl =
        process.env.FRONTEND_URL ?? process.env.APP_FRONTEND_URL;

      if (frontendUrl) {
        res.redirect(frontendUrl);
        return;
      }

      res.status(200).json({
        access_token: result.tokens.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          status: result.user.status,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleZodError(res, error);
        return;
      }

      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          GOOGLE_OAUTH_CONFIG_MISSING: {
            status: 500,
            messages: ["Konfigurasi Google OAuth belum lengkap"],
          },
          GOOGLE_TOKEN_EXCHANGE_FAILED: {
            status: 400,
            messages: ["Gagal mendapatkan token Google"],
          },
          GOOGLE_TOKEN_INVALID: {
            status: 400,
            messages: ["Token Google tidak valid"],
          },
          GOOGLE_USERINFO_FAILED: {
            status: 400,
            messages: ["Gagal mengambil data pengguna Google"],
          },
          GOOGLE_USERINFO_INCOMPLETE: {
            status: 400,
            messages: ["Data pengguna Google tidak lengkap"],
          },
        })
      ) {
        return;
      }

      logger.error("Google callback error", { error });
      res
        .status(500)
        .json(buildErrorResponse(["Terjadi kesalahan pada Google login"]));
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const token = validateAuthCookie(req.cookies);

      const user = await this.authService.getUserFromAccessToken(token);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        },
      });
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

      handleUnexpectedError(res, error, logger, "Get profile error");
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = validateRefreshCookie(req.cookies);

      const tokens =
        await this.authService.refreshAccessTokenFromRefreshToken(
          refreshToken,
        );
      setAuthCookies(res, tokens);
      setLoginStatusCookie(res, true);

      res.status(200).json({
        access_token: tokens.accessToken,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        handleDomainError(res, error, {
          REFRESH_TOKEN_MISSING: {
            status: 401,
            messages: ["Refresh token tidak ditemukan"],
          },
          REFRESH_TOKEN_INVALID: {
            status: 401,
            messages: ["Refresh token tidak valid"],
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

      handleUnexpectedError(res, error, logger, "Refresh token error");
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const token =
        typeof req.cookies?.access_token === "string"
          ? req.cookies.access_token
          : "";
      const refreshToken =
        typeof req.cookies?.refresh_token === "string"
          ? req.cookies.refresh_token
          : "";

      if (token || refreshToken) {
        await this.authService.logout(token, refreshToken);
      }

      // Hapus cookie
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: isProductionLike,
        sameSite: "lax",
        path: "/",
      });

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isProductionLike,
        sameSite: "lax",
        path: "/",
      });

      res.clearCookie("is_logged_in", {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

      res.status(200).json({ message: "Logout berhasil" });
    } catch (error) {
      handleUnexpectedError(res, error, logger, "Logout error");
    }
  };
}
