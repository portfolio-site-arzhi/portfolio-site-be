import type { Express } from "express";
import { PrismaSiteConfigRepository } from "../repository/PrismaSiteConfigRepository";
import { SiteConfigService } from "../services/siteConfigService";
import { SiteConfigLandingService } from "../services/siteConfigLandingService";
import { SiteConfigController } from "../controllers/siteConfigController";
import { getPrisma } from "../config";
import {
  createProfileUploadMiddleware,
  withHandledUploadErrors,
} from "../config/upload";

export const registerSiteConfigRoutes = (app: Express) => {
  const prisma = getPrisma();
  const siteConfigRepository = new PrismaSiteConfigRepository(prisma);
  const siteConfigService = new SiteConfigService(siteConfigRepository);
  const siteConfigLandingService = new SiteConfigLandingService(
    siteConfigRepository,
  );
  const controller = new SiteConfigController(
    siteConfigService,
    siteConfigLandingService,
  );

  const upload = createProfileUploadMiddleware();

  app.get("/site-configs", controller.list);
  app.post(
    "/site-configs/bulk",
    withHandledUploadErrors(
      upload.fields([{ name: "home_photo", maxCount: 1 }]),
    ),
    controller.bulkUpdate,
  );
};
