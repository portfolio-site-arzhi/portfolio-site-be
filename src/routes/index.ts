import type { Express } from "express";
import { registerAuthRoutes } from "./authRoute";
import { registerUserRoutes } from "./userRoute";
import { registerSiteConfigRoutes } from "./siteConfigRoute";
import { registerExperienceRoutes } from "./experienceRoute";
import { registerEducationRoutes } from "./educationRoute";
import { registerCertificationRoutes } from "./certificationRoute";
import { registerSkillRoutes } from "./skillRoute";
import { registerPortfolioRoutes } from "./portfolioRoute";
import { registerExportRoutes } from "./exportRoute";

export const registerRoutes = (app: Express) => {
  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerSiteConfigRoutes(app);
  registerExperienceRoutes(app);
  registerEducationRoutes(app);
  registerCertificationRoutes(app);
  registerSkillRoutes(app);
  registerPortfolioRoutes(app);
  registerExportRoutes(app);
};
