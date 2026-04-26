import type { Request } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (!allowedImageMimes.includes(file.mimetype)) {
    (req as Request & { fileValidationError?: string }).fileValidationError =
      "Tipe file gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP";
    cb(null, false);
    return;
  }

  cb(null, true);
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

  return multer({ storage, fileFilter });
};

export const createProfileUploadMiddleware = () =>
  createImageUploadMiddleware("profile");

export const createPortfolioUploadMiddleware = () =>
  createImageUploadMiddleware("portfolio");
