import { Router } from "express";
import candidatesRoutes from "./candidates.routes.js";
import jobPostRoutes from "./jobPost.routes.js";
import resultsRoutes from "./results.routes.js";
import courseRec from "./courseRec.routes.js"

const router = Router();
router.use("/candidates", candidatesRoutes);
router.use("/job_posts", jobPostRoutes);
router.use("/results", resultsRoutes);
router.use("/course_rec", courseRec);

export default router;
