import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { AppError } from "../utils/error";
import { ALLOWED_AUDIO_MIME_TYPES } from "../validators/schemas";

const UPLOAD_DIR = "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `audio-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const isAllowed = (ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(
    file.mimetype
  );
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}`,
        415,
        "UNSUPPORTED_MEDIA_TYPE"
      )
    );
  }
};

export  const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: 50 * 1024 * 1024,
        files: 1
    }
})


export const deleteUploadedFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // non-critical, ignore
  }
};