import fs from "fs";
import path from "path";

const UPLOADS_PUBLIC_PREFIX = "/uploads/";
const PDF_RENDERABLE_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

export const resolveLocalUploadPath = (
  value: string | null | undefined,
): string | null => {
  if (!value || !value.startsWith(UPLOADS_PUBLIC_PREFIX)) {
    return null;
  }

  const segments = value.split("/").filter(Boolean);
  if (!segments.length || segments[0] !== "uploads") {
    return null;
  }

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const fullPath = path.resolve(process.cwd(), ...segments);

  if (fullPath !== uploadsRoot && !fullPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return null;
  }

  return fs.existsSync(fullPath) ? fullPath : null;
};

export const resolvePdfRenderableUploadPath = (
  value: string | null | undefined,
): string | null => {
  const fullPath = resolveLocalUploadPath(value);
  if (!fullPath) {
    return null;
  }

  return PDF_RENDERABLE_IMAGE_EXTENSIONS.has(path.extname(fullPath).toLowerCase())
    ? fullPath
    : null;
};
