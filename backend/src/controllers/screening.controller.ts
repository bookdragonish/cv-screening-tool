import type { NextFunction, Request, Response } from "express";
import { runScreeningService } from "../services/screening/runScreening.js";
import { parseJobDescriptionInput, parseCandidateLimit } from "../services/screening/screening.helpers.js";

/**
 * This is the brain of the ai call that starts the screening. 
 * The services decides what llm model is used but both use this controller.
 * 
 * @param req {mode, text, candidateLimit}
 * Ext on how to call with postman:
 * {
  "mode": "text",
  "jobDescriptionText": "Ved Heimdal bo- og aktivitetstilbud er det ledig en fast 100 prosent stilling som miljøterapeut. Som miljøterapeut jobber du faglig og systematisk for å bidra til å gi tjenestemottakere en god og meningsfull hverdag som er tilpasset hvert enkelt individs ønsker og behov. Jobben innebærer å være fagansvarlig primærkontakt for to til tre beboere. Det vil være stort fokus på tverrfaglig samarbeid og samhandling med tjenestemottakers nettverk.",
  "candidateLimit": 20
}
 * @param res AI response object for screening result
 * @param next 
 * @returns 
 */

export async function runScreeningController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const jobDescriptionInput = parseJobDescriptionInput(req);
  if ("error" in jobDescriptionInput) {
    return res.status(jobDescriptionInput.status).json({
      error: jobDescriptionInput.error,
    });
  }

  const candidateLimit = parseCandidateLimit(req.body.candidateLimit);

  try {
    // The actual call that starts the screening process
    const result = await runScreeningService({
      jobDescriptionInput,
      candidateLimit,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}1