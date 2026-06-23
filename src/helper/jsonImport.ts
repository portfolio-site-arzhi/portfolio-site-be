import path from "path";
import type { JsonImportErrorConfig, JsonImportUploadFile } from "../model";

const normalizeUtf8Text = (buffer: Buffer): string => {
  const text = buffer.toString("utf-8");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
};

export const parseUploadedJsonFile = (
  file: JsonImportUploadFile,
  errors: JsonImportErrorConfig,
): unknown => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".json") {
    throw new Error(errors.invalidFileError);
  }

  try {
    return JSON.parse(normalizeUtf8Text(file.buffer)) as unknown;
  } catch {
    throw new Error(errors.invalidJsonError);
  }
};
