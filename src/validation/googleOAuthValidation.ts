import type {
  GoogleOAuthCallbackConfig,
  GoogleOAuthRedirectConfig,
} from "../model";

export const validateGoogleOAuthRedirectConfigFromEnv =
  (): GoogleOAuthRedirectConfig => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error("GOOGLE_OAUTH_CONFIG_MISSING");
    }

    return { clientId, redirectUri };
  };

export const validateGoogleOAuthCallbackConfigFromEnv =
  (): GoogleOAuthCallbackConfig => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("GOOGLE_OAUTH_CONFIG_MISSING");
    }

    return { clientId, clientSecret, redirectUri };
  };

export const validateGoogleTokenResponse = (
  data: unknown,
): { accessToken: string } => {
  if (typeof data !== "object" || data === null) {
    throw new Error("GOOGLE_TOKEN_INVALID");
  }

  const accessToken = (data as { access_token?: unknown }).access_token;
  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error("GOOGLE_TOKEN_INVALID");
  }

  return { accessToken };
};

export const validateGoogleUserInfo = (
  data: unknown,
): { id: string; email: string; name: string } => {
  if (typeof data !== "object" || data === null) {
    throw new Error("GOOGLE_USERINFO_INCOMPLETE");
  }

  const id = (data as { id?: unknown }).id;
  const email = (data as { email?: unknown }).email;
  const name = (data as { name?: unknown }).name;

  if (typeof id !== "string" || !id) {
    throw new Error("GOOGLE_USERINFO_INCOMPLETE");
  }

  if (typeof email !== "string" || !email) {
    throw new Error("GOOGLE_USERINFO_INCOMPLETE");
  }

  if (typeof name !== "string" || !name) {
    throw new Error("GOOGLE_USERINFO_INCOMPLETE");
  }

  return { id, email, name };
};
