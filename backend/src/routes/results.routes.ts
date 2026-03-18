import { Router } from "express";
import multer from "multer";
import * as screening from "../controllers/screening.controller.js";
import * as results from "../controllers/results.controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", results.list);
router.post("/", results.create);
router.post("/screenings/run", upload.single("jobDescriptionFile"), screening.runScreening);
router.post("/screenings", results.createScreeningRun);
router.get("/history", results.getScreeningHistory);
router.get("/job_posts/:jobPostId", results.getScreeningByJobPostId);
router.get("/:jobPostId/:candidateId", results.getById);
router.delete("/:jobPostId/:candidateId", results.deleteById);

export default router;
