import type { Express } from "express";
import { registerAuthRoutes } from "./authRoute";
import { registerUserRoutes } from "./userRoute";

export const registerRoutes = (app: Express) => {
  registerAuthRoutes(app);
  registerUserRoutes(app);
};
