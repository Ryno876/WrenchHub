import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/auth";

// Use process.cwd() for uploads path — works in both CJS and ESM
const uploadsDir = process.cwd() + "/uploads";

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req: any, file: any, cb: any) => {
    const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WebP, GIF) are allowed"));
    }
  },
});

const router = Router();

router.use(requireAuth);

router.post("/", upload.array("files", 5), (req: any, res: any) => {
  const files = req.files as any[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const urls = files.map((f: any) => `/uploads/${f.filename}`);

  res.status(201).json({ urls });
});

export default router;
