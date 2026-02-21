import type { Express } from "express";
import { SkillController } from "../controllers/skillController";
import { SkillLandingController } from "../controllers/skillLandingController";
import { PrismaSkillRepository } from "../repository/skillRepository";
import { SkillLandingService } from "../services/skillLandingService";
import { SkillService } from "../services/skillService";

export const registerSkillRoutes = (app: Express) => {
  const skillRepository = new PrismaSkillRepository();
  const skillService = new SkillService(skillRepository);
  const skillLandingService = new SkillLandingService(skillRepository);

  const controller = new SkillController(skillService);
  const landingController = new SkillLandingController(skillLandingService);

  app.get("/skills", controller.list);
  app.patch("/skills/sort", controller.updateSort);
  app.get("/skills/:id", controller.detail);
  app.post("/skills", controller.create);
  app.put("/skills/:id", controller.update);
  app.delete("/skills/:id", controller.delete);

  app.get("/landing/skills", landingController.list);
};
