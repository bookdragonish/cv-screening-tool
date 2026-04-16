import { Router } from "express";
import * as courseRec from "../controllers/courseRec.controller.js";

const router = Router();

router.get("/", courseRec.getExistingCourseRecForCandidate);
router.get("/", courseRec.getExistingCourseRecForCandidate);


export default router;
