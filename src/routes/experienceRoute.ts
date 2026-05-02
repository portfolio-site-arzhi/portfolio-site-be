import type { Express } from "express";
import { ExperienceController } from "../controllers/experienceController";
import { ExperienceLandingController } from "../controllers/experienceLandingController";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaExperienceRepository } from "../repository/experienceRepository";
import { ExperienceLandingService } from "../services/experienceLandingService";
import { ExperienceService } from "../services/experienceService";

export const registerExperienceRoutes = (app: Express) => {
  const experienceRepository = new PrismaExperienceRepository();
  const experienceService = new ExperienceService(experienceRepository);
  const experienceLandingService = new ExperienceLandingService(experienceRepository);

  const controller = new ExperienceController(experienceService);
  const landingController = new ExperienceLandingController(
    experienceLandingService,
  );
  const requireAuth = createRequireAuthMiddleware();

  app.use("/experiences", requireAuth);
  app.get("/experiences", controller.list);
  app.get("/experiences/:id", controller.detail);
  app.post("/experiences", controller.create);
  app.put("/experiences/:id", controller.update);
  app.delete("/experiences/:id", controller.delete);
  app.patch("/experiences/sort", controller.updateSort);

  app.get("/landing/experiences", landingController.list);
};
