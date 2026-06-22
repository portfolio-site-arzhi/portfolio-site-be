import type { Express } from "express";
import { SkillController } from "../controllers/skillController";
import { SkillLandingController } from "../controllers/skillLandingController";
import {
  createSkillImportUploadMiddleware,
  SKILL_IMPORT_UPLOAD_VALIDATION_MESSAGES,
  withHandledUploadErrors,
} from "../config/upload";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaSkillRepository } from "../repository/skillRepository";
import { SkillExcelService } from "../services/skillExcelService";
import { SkillLandingService } from "../services/skillLandingService";
import { SkillService } from "../services/skillService";

export const registerSkillRoutes = (app: Express) => {
  const skillRepository = new PrismaSkillRepository();
  const skillService = new SkillService(skillRepository);
  const skillExcelService = new SkillExcelService();
  const skillLandingService = new SkillLandingService(skillRepository);
  const upload = createSkillImportUploadMiddleware();
  const requireAuth = createRequireAuthMiddleware();

  const controller = new SkillController(skillService, skillExcelService);
  const landingController = new SkillLandingController(skillLandingService);

  app.use("/skills", requireAuth);
  app.get("/skills", controller.list);
  app.get("/skills/export", controller.export);
  app.post(
    "/skills/import",
    withHandledUploadErrors(
      upload.single("file"),
      SKILL_IMPORT_UPLOAD_VALIDATION_MESSAGES,
    ),
    controller.import,
  );
  app.patch("/skills/sort", controller.updateSort);
  app.get("/skills/:id", controller.detail);
  app.post("/skills", controller.create);
  app.put("/skills/:id", controller.update);
  app.delete("/skills/:id", controller.delete);

  app.get("/landing/skills", landingController.list);
};
