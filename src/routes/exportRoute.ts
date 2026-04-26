import type { Express } from "express";
import { ExportController } from "../controllers/exportController";
import { getPrisma } from "../config";
import { PrismaSiteConfigRepository } from "../repository/PrismaSiteConfigRepository";
import { PrismaCertificationRepository } from "../repository/certificationRepository";
import { PrismaEducationRepository } from "../repository/educationRepository";
import { PrismaExperienceRepository } from "../repository/experienceRepository";
import { PrismaPortfolioRepository } from "../repository/portfolioRepository";
import { PrismaSkillRepository } from "../repository/skillRepository";
import { CvPdfExportService } from "../services/cvPdfExportService";
import { PortfolioPdfExportService } from "../services/portfolioPdfExportService";
import { CertificationLandingService } from "../services/certificationLandingService";
import { EducationLandingService } from "../services/educationLandingService";
import { ExperienceLandingService } from "../services/experienceLandingService";
import { PortfolioService } from "../services/portfolioService";
import { SiteConfigLandingService } from "../services/siteConfigLandingService";
import { SkillLandingService } from "../services/skillLandingService";

export const registerExportRoutes = (app: Express) => {
  const siteConfigRepository = new PrismaSiteConfigRepository(getPrisma());
  const experienceRepository = new PrismaExperienceRepository();
  const educationRepository = new PrismaEducationRepository();
  const certificationRepository = new PrismaCertificationRepository();
  const skillRepository = new PrismaSkillRepository();
  const portfolioRepository = new PrismaPortfolioRepository();

  const cvPdfExportService = new CvPdfExportService(
    new SiteConfigLandingService(siteConfigRepository),
    new ExperienceLandingService(experienceRepository),
    new EducationLandingService(educationRepository),
    new CertificationLandingService(certificationRepository),
    new SkillLandingService(skillRepository),
  );
  const portfolioPdfExportService = new PortfolioPdfExportService(
    new PortfolioService(portfolioRepository),
  );
  const controller = new ExportController(
    cvPdfExportService,
    portfolioPdfExportService,
  );

  app.get("/exports/cv", controller.exportCv);
  app.get("/exports/portfolios", controller.exportPortfolios);
};
