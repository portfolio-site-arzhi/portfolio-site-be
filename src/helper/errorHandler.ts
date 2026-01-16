import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { ErrorResponseBody } from "../model";

export const buildErrorResponse = (
  messages: string | string[],
): ErrorResponseBody => {
  const list = Array.isArray(messages) ? messages : [messages];
  return { errors: list };
};

export const handleZodError = (res: Response, error: ZodError) => {
  const messages = error.issues.map((issue) => issue.message);
  res.status(400).json(buildErrorResponse(messages));
};

type DomainErrorMapping = {
  [code: string]: {
    status: number;
    messages: string[];
  };
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
  res.status(500).json(buildErrorResponse(["Terjadi kesalahan pada server"]));
};
