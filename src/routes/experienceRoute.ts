import type { Express } from "express";
import {
  createExperienceImportUploadMiddleware,
  EXPERIENCE_IMPORT_UPLOAD_VALIDATION_MESSAGES,
  withHandledUploadErrors,
} from "../config/upload";
import { ExperienceController } from "../controllers/experienceController";
import { ExperienceLandingController } from "../controllers/experienceLandingController";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaExperienceRepository } from "../repository/experienceRepository";
import { ExperienceImportSampleService } from "../services/experienceImportSampleService";
import { ExperienceImportService } from "../services/experienceImportService";
import { ExperienceLandingService } from "../services/experienceLandingService";
import { ExperienceService } from "../services/experienceService";

export const registerExperienceRoutes = (app: Express) => {
  const experienceRepository = new PrismaExperienceRepository();
  const experienceService = new ExperienceService(experienceRepository);
  const experienceImportService = new ExperienceImportService();
  const experienceImportSampleService = new ExperienceImportSampleService();
  const experienceLandingService = new ExperienceLandingService(experienceRepository);
  const upload = createExperienceImportUploadMiddleware();

  const controller = new ExperienceController(
    experienceService,
    experienceImportService,
    experienceImportSampleService,
  );
  const landingController = new ExperienceLandingController(
    experienceLandingService,
  );
  const requireAuth = createRequireAuthMiddleware();

  app.use("/experiences", requireAuth);
  app.get("/experiences", controller.list);
  app.get("/experiences/import/sample", controller.sampleImport);
  app.post(
    "/experiences/import",
    withHandledUploadErrors(
      upload.single("file"),
      EXPERIENCE_IMPORT_UPLOAD_VALIDATION_MESSAGES,
    ),
    controller.import,
  );
  app.get("/experiences/:id", controller.detail);
  app.post("/experiences", controller.create);
  app.put("/experiences/:id", controller.update);
  app.delete("/experiences/:id", controller.delete);
  app.patch("/experiences/sort", controller.updateSort);

  app.get("/landing/experiences", landingController.list);
};
