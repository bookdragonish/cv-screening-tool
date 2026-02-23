import { Router } from "express";
import * as candidates from "../controllers/candidates.controller.js";

const router = Router();

router.get("/", candidates.list);
router.post("/", candidates.create);
router.get("/:id", candidates.getById);
router.delete("/:id", candidates.remove);

export default router;
