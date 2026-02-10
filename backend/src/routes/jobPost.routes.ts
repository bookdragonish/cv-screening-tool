import { Router } from "express";
import * as jobPost from "../controllers/jobPost.controller.js";

const router = Router();

router.get("/", jobPost.list);
router.post("/", jobPost.create);
router.get("/:id", jobPost.getById);

export default router;
