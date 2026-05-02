import type { NextFunction, Request, RequestHandler, Response } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_SIZE_MB = MAX_IMAGE_UPLOAD_SIZE_BYTES / (1024 * 1024);

type UploadRequest = Request & { fileValidationError?: string };

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (!allowedImageMimes.includes(file.mimetype)) {
    (req as UploadRequest).fileValidationError =
      "Tipe file gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP";
    cb(null, false);
    return;
  }

  cb(null, true);
};

const getUploadValidationMessage = (error: multer.MulterError): string => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return `Ukuran file gambar maksimal ${MAX_IMAGE_UPLOAD_SIZE_MB}MB`;
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return "Field file upload tidak valid";
  }

  return "Upload file gambar tidak valid";
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
): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
  middleware(req, res, (error?: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      (req as UploadRequest).fileValidationError =
        getUploadValidationMessage(error);
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
