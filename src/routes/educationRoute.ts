import type { Express } from "express";
import { EducationController } from "../controllers/educationController";
import { EducationLandingController } from "../controllers/educationLandingController";
import { PrismaEducationRepository } from "../repository/educationRepository";
import { EducationLandingService } from "../services/educationLandingService";
import { EducationService } from "../services/educationService";

export const registerEducationRoutes = (app: Express) => {
  const educationRepository = new PrismaEducationRepository();
  const educationService = new EducationService(educationRepository);
  const educationLandingService = new EducationLandingService(educationRepository);

  const controller = new EducationController(educationService);
  const landingController = new EducationLandingController(educationLandingService);

  app.get("/educations", controller.list);
  app.get("/educations/:id", controller.detail);
  app.post("/educations", controller.create);
  app.put("/educations/:id", controller.update);
  app.delete("/educations/:id", controller.delete);
  app.patch("/educations/sort", controller.updateSort);

  app.get("/landing/educations", landingController.list);
};

