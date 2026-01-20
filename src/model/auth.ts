export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult<User> {
  user: User;
  tokens: AuthTokens;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
}

export interface SimpleFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export interface GoogleOAuthRedirectConfig {
  clientId: string;
  redirectUri: string;
}

export interface GoogleOAuthCallbackConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}
