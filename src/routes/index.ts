import type { Express } from "express";
import { registerAuthRoutes } from "./authRoute";

export const registerRoutes = (app: Express) => {
  registerAuthRoutes(app);
};

