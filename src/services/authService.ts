import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthResult, AuthTokens, GoogleProfile, User } from "../model";
import type { UserRepository } from "../repository/contracts/userRepository";
import type { RefreshTokenRepository } from "../repository/contracts/refreshTokenRepository";
import {
  validateActiveUser,
  validateUserExists,
  validateRefreshTokenExists,
} from "../validation/authDomainValidation";

const getJwtSecret = () => {
  const fromEnv = process.env.COOKIE_SECRET;
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  return "change_me_jwt_secret";
};

const getJwtExpiresIn = (): SignOptions["expiresIn"] => {
  const value = process.env.JWT_EXPIRES_IN;
  if (!value) return "1h";
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return Math.floor(asNumber);
  }
  return value as unknown as SignOptions["expiresIn"];
};

const getUserIdFromToken = (token: string): number => {
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

const generateRefreshTokenValue = () => {
  return crypto.randomBytes(64).toString("hex");
};

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async loginWithUser(user: User): Promise<AuthResult<User>> {
    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async loginWithGoogleProfile(
    profile: GoogleProfile,
  ): Promise<AuthResult<User>> {
    const existingByGoogleId = await this.userRepository.findByGoogleId(
      profile.id,
    );
    if (existingByGoogleId) {
      const activeUser = validateActiveUser(existingByGoogleId);
      const tokens = await this.generateTokens(activeUser);
      return { user: activeUser, tokens };
    }

    const existingByEmail = await this.userRepository.findByEmail(
      profile.email,
    );
    if (existingByEmail) {
      const updated = await this.userRepository.updateUser(existingByEmail.id, {
        name: profile.name,
        googleId: profile.id,
        updatedBy: 0,
      });
      const activeUser = validateActiveUser(updated);
      const tokens = await this.generateTokens(activeUser);
      return { user: activeUser, tokens };
    }

    const created = await this.userRepository.createUser({
      email: profile.email,
      password: "",
      name: profile.name,
      status: true,
      googleId: profile.id,
      createdBy: 0,
      updatedBy: 0,
    });
    const tokens = await this.generateTokens(created);
    return { user: created, tokens };
  }

  async getUserFromAccessToken(token: string): Promise<User> {
    const userId = getUserIdFromToken(token);
    const user = await this.userRepository.findById(userId);

    const existingUser = validateUserExists(user);
    return validateActiveUser(existingUser);
  }

  async refreshAccessTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<AuthTokens> {
    const existing = await this.refreshTokenRepository.findByToken(
      refreshToken,
    );
    const existingToken = validateRefreshTokenExists(existing);

    const user = await this.userRepository.findById(existingToken.user_id);
    const existingUser = validateUserExists(user);
    const activeUser = validateActiveUser(existingUser);

    await this.refreshTokenRepository.deleteById(existingToken.id);

    const tokens = await this.generateTokens(activeUser);
    return tokens;
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    };

    const secret = getJwtSecret();
    const expiresIn = getJwtExpiresIn();

    const accessToken =
      typeof expiresIn === "undefined"
        ? jwt.sign(payload, secret)
        : jwt.sign(payload, secret, { expiresIn });

    const refreshTokenValue = generateRefreshTokenValue();
    const refreshToken = await this.refreshTokenRepository.create(
      user.id,
      refreshTokenValue,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async logout(_accessToken: string, refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const existing = await this.refreshTokenRepository.findByToken(
      refreshToken,
    );
    if (!existing) {
      return;
    }

    await this.refreshTokenRepository.deleteById(existing.id);
  }
}
