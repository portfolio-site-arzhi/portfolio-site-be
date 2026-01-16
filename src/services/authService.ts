import jwt, { type SignOptions } from "jsonwebtoken";
import type { AuthResult, AuthTokens, GoogleProfile, User } from "../model";
import type { UserRepository } from "../repository/contracts/userRepository";
import { validateActiveUser } from "../validation/authDomainValidation";

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

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async loginWithUser(user: User): Promise<AuthResult<User>> {
    const tokens = this.generateTokens(user);
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
      const tokens = this.generateTokens(activeUser);
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
      const tokens = this.generateTokens(activeUser);
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
    const tokens = this.generateTokens(created);
    return { user: created, tokens };
  }

  generateTokens(user: User): AuthTokens {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    };

    const secret = getJwtSecret();
    const expiresIn = getJwtExpiresIn();

    if (typeof expiresIn === "undefined") {
      const accessToken = jwt.sign(payload, secret);
      return { accessToken };
    }

    const accessToken = jwt.sign(payload, secret, { expiresIn });
    return { accessToken };
  }
}
