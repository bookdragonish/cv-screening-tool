import { Router } from "express";
import * as results from "../controllers/results.controller.js";

const router = Router();

router.get("/", results.list);
router.post("/", results.create);
router.get("/history", results.getScreeningHistory);
router.get("/job_posts/:jobPostId", results.getScreeningByJobPostId);
router.get("/:jobPostId/:candidateId", results.getById);
router.delete("/:jobPostId/:candidateId", results.deleteById);

export default router;
