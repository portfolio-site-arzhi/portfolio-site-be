import type { Express } from "express";
import { CertificationController } from "../controllers/certificationController";
import { CertificationLandingController } from "../controllers/certificationLandingController";
import { createRequireAuthMiddleware } from "../middleware/authMiddleware";
import { PrismaCertificationRepository } from "../repository/certificationRepository";
import { CertificationLandingService } from "../services/certificationLandingService";
import { CertificationService } from "../services/certificationService";

export const registerCertificationRoutes = (app: Express) => {
  const certificationRepository = new PrismaCertificationRepository();
  const certificationService = new CertificationService(certificationRepository);
  const certificationLandingService = new CertificationLandingService(
    certificationRepository,
  );

  const controller = new CertificationController(certificationService);
  const landingController = new CertificationLandingController(
    certificationLandingService,
  );
  const requireAuth = createRequireAuthMiddleware();

  app.use("/certifications", requireAuth);
  app.get("/certifications", controller.list);
  app.get("/certifications/:id", controller.detail);
  app.post("/certifications", controller.create);
  app.put("/certifications/:id", controller.update);
  app.delete("/certifications/:id", controller.delete);
  app.patch("/certifications/sort", controller.updateSort);

  app.get("/landing/certifications", landingController.list);
};
