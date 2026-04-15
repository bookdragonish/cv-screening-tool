import type { Request } from "express";
import type { JobDescriptionInput } from "../../types/ai.types.js";

export const DEFAULT_TEXT_JOB_TITLE = "Innlimt stillingsbeskrivelse";

export function parseCandidateLimit(value: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : Number.MAX_SAFE_INTEGER;
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

