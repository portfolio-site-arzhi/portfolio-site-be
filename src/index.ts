import "dotenv/config";
import express from "express";
import { configureExpress, getPrisma, logger } from "./config";
import { registerRoutes } from "./routes";

export const app = express();
configureExpress(app);
registerRoutes(app);

app.get("/health", async (_req, res) => {
  try {
    const db = getPrisma();
    await db.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "ok" });
  } catch (error) {
    logger.error("Health check database error", { error });
    res.status(200).json({ status: "ok", db: "unreachable" });
  }
});

const port = Number(process.env.PORT ?? 9000);
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    logger.info("Server started", { port });
  });
}
