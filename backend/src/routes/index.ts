import { Router } from "express";
import candidatesRoutes from "./candidates.routes.js";
import jobPostRoutes from "./jobPost.routes.js";
import resultsRoutes from "./results.routes.js";

const router = Router();
router.use("/candidates", candidatesRoutes);
router.use("/job_posts", jobPostRoutes);
router.use("/results", resultsRoutes);

export default router;
