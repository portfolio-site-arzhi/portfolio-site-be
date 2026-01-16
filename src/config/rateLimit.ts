import type { Express } from "express";
import { rateLimit } from "express-rate-limit";
import { buildErrorResponse } from "../helper/errorHandler";

const parsePositiveInt = (value: string | undefined) => {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  const int = Math.floor(num);
  if (int <= 0) return undefined;
  return int;
};

export const configureRateLimit = (app: Express) => {
  const limit = parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS) ?? 60;
  const windowMs =
    parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS) ?? 60 * 1000;

  app.use(
    rateLimit({
      windowMs,
      limit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (_req, res) => {
        res
          .status(429)
          .json(
            buildErrorResponse(["Terlalu banyak permintaan, coba lagi nanti"]),
          );
      },
    }),
  );
};

