import type { Request } from "express";

export type UploadRequest = Request & {
  fileValidationError?: string;
};

export interface UploadValidationMessages {
  limitFileSize: string;
  limitUnexpectedFile: string;
  invalidUpload: string;
}
