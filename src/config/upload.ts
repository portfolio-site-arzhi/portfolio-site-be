import type { NextFunction, Request, RequestHandler, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import type { UploadRequest, UploadValidationMessages } from "../model";

const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];
const allowedExcelMimes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
];
const allowedJsonMimes = [
  "application/json",
  "text/json",
  "text/plain",
  "application/octet-stream",
];
const MAX_IMAGE_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_SIZE_MB = MAX_IMAGE_UPLOAD_SIZE_BYTES / (1024 * 1024);
const MAX_EXCEL_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_EXCEL_UPLOAD_SIZE_MB = MAX_EXCEL_UPLOAD_SIZE_BYTES / (1024 * 1024);
const MAX_JSON_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_JSON_UPLOAD_SIZE_MB = MAX_JSON_UPLOAD_SIZE_BYTES / (1024 * 1024);

const IMAGE_UPLOAD_VALIDATION_MESSAGES = {
  limitFileSize: `Ukuran file gambar maksimal ${MAX_IMAGE_UPLOAD_SIZE_MB}MB`,
  limitUnexpectedFile: "Field file upload tidak valid",
  invalidUpload: "Upload file gambar tidak valid",
};

export const SKILL_IMPORT_UPLOAD_VALIDATION_MESSAGES = {
  limitFileSize: `Ukuran file Excel maksimal ${MAX_EXCEL_UPLOAD_SIZE_MB}MB`,
  limitUnexpectedFile: "Field file Excel tidak valid",
  invalidUpload: "Upload file Excel tidak valid",
};

export const EXPERIENCE_IMPORT_UPLOAD_VALIDATION_MESSAGES = {
  limitFileSize: `Ukuran file JSON maksimal ${MAX_JSON_UPLOAD_SIZE_MB}MB`,
  limitUnexpectedFile: "Field file import experience tidak valid",
  invalidUpload: "Upload file import experience tidak valid",
};

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (!allowedImageMimes.includes(file.mimetype)) {
    (req as UploadRequest).fileValidationError =
      "Tipe file gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP";
    cb(null, false);
    return;
  }

  cb(null, true);
};

const excelFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAllowedMime = allowedExcelMimes.includes(file.mimetype);

  if (extension !== ".xlsx" || !isAllowedMime) {
    (req as UploadRequest).fileValidationError =
      "Tipe file Excel tidak didukung. Gunakan file .xlsx";
    cb(null, false);
    return;
  }

  cb(null, true);
};

const jsonFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isAllowedMime = allowedJsonMimes.includes(file.mimetype);

  if (extension !== ".json" || !isAllowedMime) {
    (req as UploadRequest).fileValidationError =
      "Tipe file JSON tidak didukung. Gunakan file .json";
    cb(null, false);
    return;
  }

  cb(null, true);
};

const getUploadValidationMessage = (
  error: multer.MulterError,
  messages: UploadValidationMessages,
): string => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return messages.limitFileSize;
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return messages.limitUnexpectedFile;
  }

  return messages.invalidUpload;
};

const createImageUploadMiddleware = (folder: "profile" | "portfolio") => {
  const uploadDir = path.join(process.cwd(), "uploads", folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
      cb(null, `${base}-${unique}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: MAX_IMAGE_UPLOAD_SIZE_BYTES,
    },
  });
};

export const withHandledUploadErrors = (
  middleware: RequestHandler,
  messages: UploadValidationMessages = IMAGE_UPLOAD_VALIDATION_MESSAGES,
): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
  middleware(req, res, (error?: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      (req as UploadRequest).fileValidationError =
        getUploadValidationMessage(error, messages);
      next();
      return;
    }

    next(error);
  });
};

export const createProfileUploadMiddleware = () =>
  createImageUploadMiddleware("profile");

export const createPortfolioUploadMiddleware = () =>
  createImageUploadMiddleware("portfolio");

export const createSkillImportUploadMiddleware = () =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter: excelFileFilter,
    limits: {
      fileSize: MAX_EXCEL_UPLOAD_SIZE_BYTES,
    },
  });

export const createExperienceImportUploadMiddleware = () =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter: jsonFileFilter,
    limits: {
      fileSize: MAX_JSON_UPLOAD_SIZE_BYTES,
    },
  });
