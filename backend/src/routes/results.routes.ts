import { Router } from "express";
import multer from "multer";
import * as results from "../controllers/results.controller.js";
import * as ai from "../controllers/screening.controller.js"

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/screenings/run", upload.single("jobDescriptionFile"), ai.runScreeningController);
router.post("/screenings", results.createScreeningRun);
router.get("/history", results.getScreeningHistory);
router.get("/job_posts/:jobPostId", results.getScreeningByJobPostId);
router.get("/candidates/:candidateId", results.getScreeningByCandidateId);

export default router;
