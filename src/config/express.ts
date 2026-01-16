import type { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import qs from "qs";
import { configureMethodOverride } from "./methodOverride";
import { configureRateLimit } from "./rateLimit";

export const configureExpress = (app: Express) => {
  app.set("query parser", (str: string) => qs.parse(str));

  const isProduction = process.env.NODE_ENV !== "development";
  const corsOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: isProduction ? (corsOrigins.length ? corsOrigins : false) : true,
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
      ],
    }),
  );
  const cookieSecret = process.env.COOKIE_SECRET;
  app.use(cookieSecret ? cookieParser(cookieSecret) : cookieParser());

  configureRateLimit(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  configureMethodOverride(app);
};
