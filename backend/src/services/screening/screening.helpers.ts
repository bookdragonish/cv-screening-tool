import type { Request } from "express";
import type { JobDescriptionInput } from "../../types/GeminiTypes.js";

export const MAX_CANDIDATES_PER_RUN = 20;
export const DEFAULT_TEXT_JOB_TITLE = "Innlimt stillingsbeskrivelse";

// Ensures the candidateLimit is set as a number or returns default
export function parseCandidateLimit(value: number ){
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return MAX_CANDIDATES_PER_RUN;
  }

  return Math.max(1, Math.min(MAX_CANDIDATES_PER_RUN, Math.floor(parsed)));
}

// Checks for pdf or text job input.
export function parseJobDescriptionInput(
  req: Request,
): JobDescriptionInput | { error: string; status: number } {
  const mode = typeof req.body.mode === "string" ? req.body.mode : "";

  if (mode === "text") {
    const text =
      typeof req.body.jobDescriptionText === "string"
        ? req.body.jobDescriptionText.trim()
        : "";

    if (!text) {
      return {
        error: "Stillingsbeskrivelse er påkrevd.",
        status: 400,
      };
    }

    return { mode: "text", text };
  }

  if (mode === "pdf") {
    if (!req.file) {
      return {
        error: "Stillingsbeskrivelse (PDF) mangler.",
        status: 400,
      };
    }

    if (req.file.mimetype !== "application/pdf") {
      return {
        error: "Kun PDF-filer er støttet for stillingsbeskrivelse.",
        status: 415,
      };
    }

    return {
      mode: "pdf",
      file: req.file.buffer,
      originalName: req.file.originalname || "job-description.pdf",
    };
  }

  return {
    error: "Modus må være enten tekst eller PDF.",
    status: 400,
  };
}

// Called if the input is the pdf. The jobtitle is set to be the name of the pdf or default
export function getFallbackJobTitle(jobDescriptionInput: JobDescriptionInput): string {
  if (jobDescriptionInput.mode === "pdf") {
    return (
      jobDescriptionInput.originalName.replace(/\.pdf$/i, "") || "Screening"
    );
  }

  return DEFAULT_TEXT_JOB_TITLE;
}

