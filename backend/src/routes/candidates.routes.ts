import { Router } from "express";
import * as candidates from "../controllers/candidates.controller.js";
import multer from "multer";

const router = Router();

router.get("/", candidates.list);
router.post("/", candidates.create);
router.get("/:id", candidates.getById);
router.get("/:id/cv", candidates.getCV);
 router.delete("/:id", candidates.remove);
router.put("/:id", candidates.update);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
router.post("/:id/cv", upload.single("cv"), candidates.uploadCV);
export default router;
