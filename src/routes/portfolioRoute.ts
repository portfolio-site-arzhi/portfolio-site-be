import type { Express } from "express";
import { PortfolioController } from "../controllers/portfolioController";
import { PortfolioLandingController } from "../controllers/portfolioLandingController";
import {
  createPortfolioImportUploadMiddleware,
  createPortfolioUploadMiddleware,
  PORTFOLIO_IMPORT_UPLOAD_VALIDATION_MESSAGES,
  withHandledUploadErrors,
} from "../config/upload";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaPortfolioRepository } from "../repository/portfolioRepository";
import { PortfolioImportSampleService } from "../services/portfolioImportSampleService";
import { PortfolioImportService } from "../services/portfolioImportService";
import { PortfolioLandingService } from "../services/portfolioLandingService";
import { PortfolioService } from "../services/portfolioService";

export const registerPortfolioRoutes = (app: Express) => {
  const portfolioRepository = new PrismaPortfolioRepository();
  const portfolioService = new PortfolioService(portfolioRepository);
  const portfolioImportService = new PortfolioImportService();
  const portfolioImportSampleService = new PortfolioImportSampleService();
  const portfolioLandingService = new PortfolioLandingService(portfolioRepository);

  const controller = new PortfolioController(
    portfolioService,
    portfolioImportService,
    portfolioImportSampleService,
  );
  const landingController = new PortfolioLandingController(portfolioLandingService);
  const upload = createPortfolioUploadMiddleware();
  const importUpload = createPortfolioImportUploadMiddleware();
  const requireAuth = createRequireAuthMiddleware();

  app.use("/portfolios", requireAuth);
  app.get("/portfolios", controller.list);
  app.get("/portfolios/import/sample", controller.sampleImport);
  app.post(
    "/portfolios/import",
    withHandledUploadErrors(
      importUpload.single("file"),
      PORTFOLIO_IMPORT_UPLOAD_VALIDATION_MESSAGES,
    ),
    controller.import,
  );
  app.get("/portfolios/:id", controller.detail);
  app.post(
    "/portfolios",
    withHandledUploadErrors(upload.single("image")),
    controller.create,
  );
  app.put(
    "/portfolios/:id",
    withHandledUploadErrors(upload.single("image")),
    controller.update,
  );
  app.delete("/portfolios/:id", controller.delete);
  app.patch("/portfolios/sort", controller.updateSort);

  app.get("/landing/portfolios", landingController.list);
  app.get("/landing/portfolios/:slug", landingController.detail);
};
