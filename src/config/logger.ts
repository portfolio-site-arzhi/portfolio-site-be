import { createLogger, format, transports } from "winston";

const isProductionLike = process.env.NODE_ENV !== "development";

export const logger = createLogger({
  level: isProductionLike ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      level: isProductionLike ? "info" : "debug",
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf((info) => {
          const { timestamp, level, message, ...meta } = info;
          const hasMeta = Object.keys(meta).length > 0;
          const metaString = hasMeta ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} [${level}] ${message}${metaString}`;
        }),
      ),
    }),
  ],
});

