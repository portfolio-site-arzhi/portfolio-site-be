import jwt from "jsonwebtoken";
import { getJwtSecret, getPrisma } from "../../src/config";

export const createAccessTokenCookie = async (options?: {
  email?: string;
  name?: string;
  status?: boolean;
}) => {
  const prisma = getPrisma();
  const user = await prisma.user.create({
    data: {
      email:
        options?.email ??
        `auth-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`,
      password: "dummy-password",
      name: options?.name ?? "Authenticated User",
      status: options?.status ?? true,
      created_by: 0,
      updated_by: 0,
    },
  });

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    },
    getJwtSecret(),
  );

  return {
    user,
    token,
    cookie: `access_token=${token}`,
  };
};
