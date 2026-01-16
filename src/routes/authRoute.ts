import type { Express } from "express";
import { PrismaUserRepository } from "../repository/userRepository";
import { AuthService } from "../services/authService";
import { AuthController } from "../controllers/authController";

export const registerAuthRoutes = (app: Express) => {
  const userRepository = new PrismaUserRepository();
  const authService = new AuthService(userRepository);
  const controller = new AuthController(authService);

  // app.post("/auth/login", controller.login);
  app.get("/auth/google", controller.googleAuth);
  app.get("/auth/google/callback", controller.googleCallback);
  app.get("/auth/profile", controller.getProfile);
  app.post("/auth/refresh-token", controller.refreshToken);
  app.post("/auth/logout", controller.logout);
};
