import type { Express } from "express";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaUserRepository } from "../repository/userRepository";
import { UserService } from "../services/userService";
import { UserController } from "../controllers/userController";

export const registerUserRoutes = (app: Express) => {
  const userRepository = new PrismaUserRepository();
  const userService = new UserService(userRepository);
  const controller = new UserController(userService);
  const requireAuth = createRequireAuthMiddleware();

  app.use("/users", requireAuth);
  app.get("/users", controller.list);
  app.get("/users/:id", controller.detail);
  app.post("/users", controller.create);
  app.put("/users/:id", controller.update);
  app.patch("/users/:id/status", controller.updateStatus);
  app.delete("/users/:id", controller.delete);
};
