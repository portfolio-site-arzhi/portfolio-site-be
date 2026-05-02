import type { Express } from "express";
import { PortfolioController } from "../controllers/portfolioController";
import { PortfolioLandingController } from "../controllers/portfolioLandingController";
import {
  createPortfolioUploadMiddleware,
  withHandledUploadErrors,
} from "../config/upload";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaPortfolioRepository } from "../repository/portfolioRepository";
import { PortfolioLandingService } from "../services/portfolioLandingService";
import { PortfolioService } from "../services/portfolioService";

export const registerPortfolioRoutes = (app: Express) => {
  const portfolioRepository = new PrismaPortfolioRepository();
  const portfolioService = new PortfolioService(portfolioRepository);
  const portfolioLandingService = new PortfolioLandingService(portfolioRepository);

  const controller = new PortfolioController(portfolioService);
  const landingController = new PortfolioLandingController(portfolioLandingService);
  const upload = createPortfolioUploadMiddleware();
  const requireAuth = createRequireAuthMiddleware();

  app.use("/portfolios", requireAuth);
  app.get("/portfolios", controller.list);
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
