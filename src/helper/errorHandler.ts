import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { DomainErrorMapping, ErrorResponseBody } from "../model";

export const buildErrorResponse = (
  messages: string | string[],
): ErrorResponseBody => {
  const list = Array.isArray(messages) ? messages : [messages];
  return { errors: list };
};

export const handleJsonSyntaxError = (res: Response, error: unknown) => {
  if (error instanceof SyntaxError) {
    res.status(400).json(buildErrorResponse(["Payload JSON tidak valid"]));
    return true;
  }

  return false;
};

export const handleZodError = (res: Response, error: ZodError) => {
  const messages = error.issues.map((issue) => issue.message);
  res.status(400).json(buildErrorResponse(messages));
};

export const handleDomainError = (
  res: Response,
  error: Error,
  mapping: DomainErrorMapping,
) => {
  const config = mapping[error.message];
  if (!config) {
    return false;
  }

  res.status(config.status).json(buildErrorResponse(config.messages));
  return true;
};

export const handleUnexpectedError = (
  res: Response,
  error: unknown,
  logger: { error: (message: string, meta?: unknown) => void },
  message: string,
) => {
  logger.error(message, { error });

  if (typeof error === "object" && error !== null) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code === "P2021") {
      res.status(500).json(
        buildErrorResponse([
          "Database schema tidak sesuai dengan aplikasi (tabel belum tersedia, jalankan migrasi)",
        ]),
      );
      return;
    }

    if (typeof code === "string" && code === "P2022") {
      res.status(500).json(
        buildErrorResponse([
          "Database schema tidak sesuai dengan aplikasi (migrasi belum dijalankan)",
        ]),
      );
      return;
    }

    const name = (error as { name?: unknown }).name;
    if (typeof name === "string" && name === "PrismaClientValidationError") {
      res.status(500).json(
        buildErrorResponse([
          "Prisma Client tidak sesuai dengan schema (jalankan prisma generate)",
        ]),
      );
      return;
    }
  }

  res.status(500).json(buildErrorResponse(["Terjadi kesalahan pada server"]));
};
