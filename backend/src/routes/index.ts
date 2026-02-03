import { Router } from "express";
import candidatesRoutes from "./candidates.routes.js";

const router = Router();
router.use("/candidates", candidatesRoutes);

export default router;
