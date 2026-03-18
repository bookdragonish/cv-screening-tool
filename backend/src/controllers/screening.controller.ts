import type { NextFunction, Request, Response } from "express";

import { runScreeningWithGemini } from "./geminiScreening.controller.js";
import { parsePdf } from "../middleware/PdfParser.js";
import { pool } from "../db/pool.js";
import { buildCandidateEvalPrompt, buildJobProfileFromTextPrompt, buildRankingPrompt } from "../services/llm/gemini/prompts/prompts.js";
import { parseCandidateEval, parseJobProfile, parseRanking } from "../services/llm/gemini/schemas.js";
import type { CandidateEval, JobProfile } from "../types/GeminiTypes.js";

type ApiCandidate = {
  id: number;
  name?: string | null;
  email?: string | null;
  cv_pdf: Buffer;
};

type CandidateWithCvText = {
  candidate: ApiCandidate;
  cvText: string;
};

type ScreeningCandidate = {
  id: number;
  rank: number;
  name: string;
  role: string;
  score: number;
  met: string[];
  missing: string[];
  summary: string;
  experience: string[];
  education: string[];
  email: string;
  phone: string;
};

type SaveScreeningRunPayload = {
  title: string;
  header: string;
  description: string;
  hardQualifications: string[];
  softQualifications: string[];
  candidates: Array<{
    candidateId: number;
    rank: number;
    score: number;
    qualified: boolean;
    qualificationsMet: string[];
    qualificationsMissing: string[];
    summary?: string;
  }>;
};

type RunScreeningResponse = {
  screeningRecord: SaveScreeningRunPayload;
  requiredSkills: string[];
  candidates: ScreeningCandidate[];
};

type JobDescriptionInput =
  | { mode: "text"; text: string }
  | { mode: "pdf"; file: Buffer; originalName: string };

type NorLlmResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const MAX_CANDIDATES_PER_RUN = 20;
const DEFAULT_TEXT_JOB_TITLE = "Innlimt stillingsbeskrivelse";
const NORLLM_URL = "https://llm.hpc.ntnu.no/v1/chat/completions";
const NORLLM_MODEL = "NorwAI/NorwAI-Magistral-24B-reasoning";

function stripCodeFences(s: string): string {
  return s.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

function extractJsonObjectCandidates(text: string): string[] {
  const s = stripCodeFences(text);

  const candidates: string[] = [];
  for (let start = s.indexOf("{"); start !== -1; start = s.indexOf("{", start + 1)) {
    let depth = 0;
    for (let i = start; i < s.length; i += 1) {
      if (s[i] === "{") depth += 1;
      else if (s[i] === "}") depth -= 1;
      if (depth === 0) {
        candidates.push(s.slice(start, i + 1));
        break;
      }
    }
  }

  return candidates;
}

function parseFirstJsonObject(text: string): unknown {
  const candidates = extractJsonObjectCandidates(text);
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
    }
  }

  throw new Error("Could not parse any JSON object from response.");
}

function pickLikelyJsonRoot(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};

  const record = value as Record<string, unknown>;
  const nested = record.JSON;
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }

  const nestedLower = record.json;
  if (nestedLower && typeof nestedLower === "object") {
    return nestedLower as Record<string, unknown>;
  }

  return record;
}

function toNonEmptyStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

/**
 * If norLLM gives output in the wrong language
 */
function normalizeImpact(value: unknown): "high" | "medium" | "low" {
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (s === "high" || s === "hoy" || s === "høy") return "high";
  if (s === "low" || s === "lav") return "low";
  return "medium";
}

function toScore(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Tries to fix output
 *
 * NorLLM sometimes produces weird output so we need to try and extract relevant info and repair it
 */
function fixCandidateEval(params: {
  text: string;
  fallbackCandidateId: string;
  fallbackCandidateLabel: string;
}): CandidateEval {
  const { text, fallbackCandidateId, fallbackCandidateLabel } = params;

  try {
    return parseCandidateEval(text);
  } catch {
    let raw: Record<string, unknown> = {};
    try {
      const parsed = parseFirstJsonObject(text);
      raw = pickLikelyJsonRoot(parsed);
    } catch {
    }

    const score = toScore(raw.overall_score);
    const strengthsRaw = Array.isArray(raw.strengths) ? raw.strengths : [];
    const gapsRaw = Array.isArray(raw.gaps) ? raw.gaps : [];

    const strengths = strengthsRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const point = normalizeString(typeof record.point === "string" ? record.point : "");
        const evidence = normalizeString(typeof record.evidence === "string" ? record.evidence : "");
        if (!point && !evidence) return null;
        return { point: point || "Uspesifisert styrke", evidence: evidence || "Ikke oppgitt" };
      })
      .filter((item): item is { point: string; evidence: string } => item !== null);

    const gaps = gapsRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const point = normalizeString(typeof record.point === "string" ? record.point : "");
        const evidence = normalizeString(typeof record.evidence === "string" ? record.evidence : "");
        if (!point && !evidence) return null;
        return {
          point: point || "Uspesifisert gap",
          evidence: evidence || "Ikke oppgitt",
          impact: normalizeImpact(record.impact),
        };
      })
      .filter((item): item is { point: string; evidence: string; impact: "high" | "medium" | "low" } => item !== null);

    return {
      candidate_id:
        normalizeString(typeof raw.candidate_id === "string" ? raw.candidate_id : "") || fallbackCandidateId,
      candidate_label:
        normalizeString(typeof raw.candidate_label === "string" ? raw.candidate_label : "") ||
        fallbackCandidateLabel,
      candidate_role: normalizeString(typeof raw.candidate_role === "string" ? raw.candidate_role : "") || "Kandidat",
      contact_phone: normalizeString(typeof raw.contact_phone === "string" ? raw.contact_phone : "") || "Ikke oppgitt",
      qualified: typeof raw.qualified === "boolean" ? raw.qualified : score >= 50,
      overall_score: score,
      experience_highlights: toNonEmptyStringArray(raw.experience_highlights),
      education: toNonEmptyStringArray(raw.education),
      strengths: strengths.length ? strengths : [{ point: "Ingen tydelige styrker", evidence: "Ikke oppgitt" }],
      gaps,
      unknowns: toNonEmptyStringArray(raw.unknowns),
    };
  }
}

/**
 * Tries to fix ranking since norLLM can be weird about output
 */
function fixRanking(text: string): ReturnType<typeof parseRanking> {
  try {
    return parseRanking(text);
  } catch {
    let raw: Record<string, unknown> = {};
    try {
      raw = pickLikelyJsonRoot(parseFirstJsonObject(text));
    } catch {
    }

    const roleTitle =
      normalizeString(typeof raw.role_title === "string" ? raw.role_title : "") || "Screening";
    const rankingRaw = Array.isArray(raw.ranking) ? raw.ranking : [];

    const normalizedRanking = rankingRaw
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const candidateId = normalizeString(
          typeof record.candidate_id === "string" ? record.candidate_id : "",
        );
        if (!candidateId) return null;

        const candidateLabel =
          normalizeString(typeof record.candidate_label === "string" ? record.candidate_label : "") ||
          `Kandidat ${candidateId}`;

        return {
          rank:
            Number.isFinite(Number(record.rank)) && Number(record.rank) > 0
              ? Math.floor(Number(record.rank))
              : index + 1,
          candidate_id: candidateId,
          candidate_label: candidateLabel,
          overall_score: toScore(record.overall_score),
          qualified: typeof record.qualified === "boolean" ? record.qualified : toScore(record.overall_score) >= 50,
          summary:
            normalizeString(typeof record.summary === "string" ? record.summary : "") ||
            "Ingen oppsummering tilgjengelig.",
        };
      })
      .filter(
        (item): item is {
          rank: number;
          candidate_id: string;
          candidate_label: string;
          overall_score: number;
          qualified: boolean;
          summary: string;
        } => item !== null,
      );

    const normalized = {
      role_title: roleTitle,
      ranking: normalizedRanking,
    };

    return parseRanking(JSON.stringify(normalized));
  }
}

/**
 * Gives a ranking based on score if norLLM gives bad output
 */
function buildFallbackRankingFromEvals(params: {
  jobProfile: JobProfile;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
}): ReturnType<typeof parseRanking> {
  const { jobProfile, evals, candidatesWithCv } = params;

  const candidateById = new Map(candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]));

  const ranking = evals
    .map((evaluation) => {
      const candidate = candidateById.get(evaluation.candidate_id);
      if (!candidate) return null;

      const score = toScore(evaluation.overall_score);
      const label =
        normalizeString(evaluation.candidate_label) ||
        normalizeString(candidate.name) ||
        `Kandidat ${candidate.id}`;

      const summary =
        normalizeString(evaluation.strengths?.[0]?.point) ||
        normalizeString(evaluation.candidate_role) ||
        "Ingen oppsummering tilgjengelig.";

      return {
        candidate_id: String(candidate.id),
        candidate_label: label,
        overall_score: score,
        qualified: typeof evaluation.qualified === "boolean" ? evaluation.qualified : score >= 50,
        summary,
      };
    })
    .filter(
      (item): item is {
        candidate_id: string;
        candidate_label: string;
        overall_score: number;
        qualified: boolean;
        summary: string;
      } => item !== null,
    )
    .sort((a, b) => b.overall_score - a.overall_score)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    role_title: normalizeString(jobProfile.role_title) || "Screening",
    ranking,
  };
}

function normalizeString(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

function normalizeStringList(values: string[] | undefined): string[] {
  if (!values?.length) return [];

  return Array.from(new Set(values.map((value) => normalizeString(value)).filter(Boolean)));
}

function getFallbackJobTitle(jobDescriptionInput: JobDescriptionInput): string {
  if (jobDescriptionInput.mode === "pdf") {
    return jobDescriptionInput.originalName.replace(/\.pdf$/i, "") || "Screening";
  }

  return DEFAULT_TEXT_JOB_TITLE;
}

function parseCandidateLimit(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return MAX_CANDIDATES_PER_RUN;
  return Math.max(1, Math.min(MAX_CANDIDATES_PER_RUN, Math.floor(parsed)));
}

function parseJobDescriptionInput(req: Request): JobDescriptionInput | { error: string; status: number } {
  const mode = typeof req.body.mode === "string" ? req.body.mode : "";

  if (mode === "text") {
    const text = typeof req.body.jobDescriptionText === "string" ? req.body.jobDescriptionText.trim() : "";
    if (!text) {
      return { error: "Stillingsbeskrivelse er påkrevd.", status: 400 };
    }

    return { mode: "text", text };
  }

  if (mode === "pdf") {
    if (!req.file) {
      return { error: "Stillingsbeskrivelse (PDF) mangler.", status: 400 };
    }

    if (req.file.mimetype !== "application/pdf") {
      return { error: "Kun PDF-filer er støttet for stillingsbeskrivelse.", status: 415 };
    }

    return {
      mode: "pdf",
      file: req.file.buffer,
      originalName: req.file.originalname || "job-description.pdf",
    };
  }

  return { error: "Modus må være enten tekst eller PDF.", status: 400 };
}

async function callNorLlm(prompt: string): Promise<string> {
  const apiKey = process.env.NORLLM_KEY;
  if (!apiKey) {
    throw new Error("Mangler NORLLM_KEY.");
  }

  const response = await fetch(NORLLM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NORLLM_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `NorLLM feilet: ${response.status}.`);
  }

  const data = (await response.json()) as NorLlmResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("NorLLM ga ikke tilbake noe tekst.");
  }

  return content;
}

/**
 * If output cant be parsed, tries to repair the prompt with a new one that asks norLLM to fix it
 */
async function parseNorLlmJsonWithRepair<T>(params: {
  rawText: string;
  schemaDescription: string;
  parse: (text: string) => T;
}): Promise<T> {
  const { rawText, schemaDescription, parse } = params;

  try {
    return parse(rawText);
  } catch {
    const repairPrompt = [
      "You are a strict JSON formatter.",
      "Convert the content below into a valid JSON object that matches the schema.",
      "Return only JSON. Use double quotes for all keys and string values.",
      "Do not add markdown code fences.",
      "",
      "Schema:",
      schemaDescription,
      "",
      "Content to repair:",
      rawText,
    ].join("\n");

    const repairedText = await callNorLlm(repairPrompt);
    return parse(repairedText);
  }
}

async function loadCandidatesWithCvText(limit: number): Promise<CandidateWithCvText[]> {
  const r = await pool.query(
    "select id, name, email, cv_pdf from candidates where cv_pdf is not null order by id desc limit $1",
    [limit],
  );

  const rows = r.rows as ApiCandidate[];
  const result: CandidateWithCvText[] = [];

  for (const candidate of rows) {
    if (!Buffer.isBuffer(candidate.cv_pdf) || !candidate.cv_pdf.length) {
      continue;
    }

    const cvText = await parsePdf(candidate.cv_pdf);
    if (!cvText.trim()) {
      continue;
    }

    result.push({ candidate, cvText });
  }

  return result;
}

async function getJobDescriptionText(jobDescriptionInput: JobDescriptionInput): Promise<string> {
  if (jobDescriptionInput.mode === "text") {
    return jobDescriptionInput.text;
  }

  const parsedText = await parsePdf(jobDescriptionInput.file);
  if (!parsedText.trim()) {
    throw new Error("Kunne ikke lese tekst fra opplastet stillingsbeskrivelse.");
  }

  return parsedText;
}

async function createJobProfileFromNorLlm(jobDescriptionText: string): Promise<JobProfile> {
  const prompt = buildJobProfileFromTextPrompt(jobDescriptionText);
  const responseText = await callNorLlm(prompt);
  return parseNorLlmJsonWithRepair({
    rawText: responseText,
    schemaDescription: `{
  "role_title": string,
  "must_haves": string[],
  "nice_to_haves": string[]
}`,
    parse: parseJobProfile,
  });
}

async function evaluateCandidatesWithNorLlm(params: {
  candidatesWithCv: CandidateWithCvText[];
  jobProfile: JobProfile;
}): Promise<CandidateEval[]> {
  const { candidatesWithCv, jobProfile } = params;

  const evals: CandidateEval[] = [];
  for (const item of candidatesWithCv) {
    const candidate = item.candidate;
    const prompt = `${buildCandidateEvalPrompt({
      jobProfile,
      candidateId: String(candidate.id),
      candidateLabel: candidate.name ?? `candidate-${candidate.id}`,
    })}\n\n<candidate_cv_text>\n${item.cvText}\n</candidate_cv_text>`;

    const responseText = await callNorLlm(prompt);
    const parsedEval = await parseNorLlmJsonWithRepair({
      rawText: responseText,
      schemaDescription: `{
            "candidate_id": string,
            "candidate_label": string,
            "candidate_role": string,
            "contact_phone": string,
            "qualified": boolean,
            "overall_score": number,
            "experience_highlights": string[],
            "education": string[],
            "strengths": [{"point": string, "evidence": string}],
            "gaps": [{"point": string, "evidence": string, "impact": "high"|"medium"|"low"}],
            "unknowns": string[]
        }`,
      parse: (text) =>
        fixCandidateEval({
          text,
          fallbackCandidateId: String(candidate.id),
          fallbackCandidateLabel: candidate.name ?? `candidate-${candidate.id}`,
        }),
    });
    evals.push(parsedEval);
  }

  return evals;
}

function mapToScreeningCandidates(params: {
  ranking: ReturnType<typeof parseRanking>;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
}): ScreeningCandidate[] {
  const { ranking, evals, candidatesWithCv } = params;

  const dbCandidatesById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );
  const evalByCandidateId = new Map(evals.map((item) => [item.candidate_id, item]));

  return ranking.ranking
    .map((rankedItem, index) => {
      const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
      if (!dbCandidate) return null;

      const evalResult = evalByCandidateId.get(rankedItem.candidate_id);
      const met = evalResult?.strengths.map((item) => item.point).filter(Boolean) ?? [];
      const missing = evalResult?.gaps.map((item) => item.point).filter(Boolean) ?? [];
      const experience = evalResult?.strengths.map((item) => item.evidence).filter(Boolean) ?? [];
      const unknowns = evalResult?.unknowns.filter(Boolean) ?? [];

      const normalizedScore = Math.max(0, Math.min(100, Math.round(rankedItem.overall_score)));

      return {
        id: dbCandidate.id,
        rank: rankedItem.rank ?? index + 1,
        name: dbCandidate.name?.trim() || `Kandidat ${dbCandidate.id}`,
        role: evalResult?.candidate_role?.trim() || "Kandidat",
        score: normalizedScore,
          met,
        missing,
        summary: rankedItem.summary || "Ingen oppsummering tilgjengelig.",
        experience: evalResult?.experience_highlights?.length
          ? evalResult.experience_highlights.slice(0, 4)
          : experience.length
            ? experience.slice(0, 4)
            : ["Ikke oppgitt"],
        education: evalResult?.education?.length
          ? evalResult.education.slice(0, 3)
          : unknowns.length
            ? unknowns.slice(0, 3)
            : ["Ikke oppgitt"],
        email: dbCandidate.email ?? "Ikke oppgitt",
        phone: evalResult?.contact_phone?.trim() || "Ikke oppgitt",
      };
    })
    .filter((item): item is ScreeningCandidate => item !== null)
    .sort((a, b) => a.rank - b.rank);
}

function buildScreeningRecord(params: {
  jobDescriptionInput: JobDescriptionInput;
  jobProfile: JobProfile;
  ranking: ReturnType<typeof parseRanking>;
  evals: CandidateEval[];
  candidatesWithCv: CandidateWithCvText[];
  jobDescriptionText: string;
}): SaveScreeningRunPayload {
  const { jobDescriptionInput, jobProfile, ranking, evals, candidatesWithCv, jobDescriptionText } = params;

  const dbCandidatesById = new Map(
    candidatesWithCv.map((item) => [String(item.candidate.id), item.candidate]),
  );
  const evalByCandidateId = new Map(evals.map((item) => [item.candidate_id, item]));

  const title = normalizeString(jobProfile.role_title) || getFallbackJobTitle(jobDescriptionInput);
  const hardQualifications = normalizeStringList(jobProfile.must_haves);
  const softQualifications = normalizeStringList(jobProfile.nice_to_haves);
  const candidates: SaveScreeningRunPayload["candidates"] = [];

  for (const [index, rankedItem] of ranking.ranking.entries()) {
    const dbCandidate = dbCandidatesById.get(rankedItem.candidate_id);
    if (!dbCandidate) continue;

    const evalResult = evalByCandidateId.get(rankedItem.candidate_id);
    const met = normalizeStringList(evalResult?.strengths.map((item) => item.point));
    const missing = normalizeStringList(evalResult?.gaps.map((item) => item.point));
    const normalizedScore = Math.max(0, Math.min(100, Math.round(rankedItem.overall_score)));

    candidates.push({
      candidateId: dbCandidate.id,
      rank: rankedItem.rank ?? index + 1,
      score: normalizedScore,
      qualified: rankedItem.qualified,
        qualificationsMet: met,
      qualificationsMissing: missing,
      summary: normalizeString(rankedItem.summary) || "Ingen oppsummering tilgjengelig.",
    });
  }

  candidates.sort((a, b) => a.rank - b.rank);

  return {
    title,
    header: title,
    description:
      jobDescriptionInput.mode === "text"
        ? normalizeString(jobDescriptionText) || `Stillingsbeskrivelse for ${title}`
        : `Analysert fra opplastet PDF: ${jobDescriptionInput.originalName}`,
    hardQualifications,
    softQualifications,
    candidates,
  };
}

async function runScreeningWithNorLlm(req: Request, res: Response, next: NextFunction) {
  const parsedInput = parseJobDescriptionInput(req);
  if ("error" in parsedInput) {
    return res.status(parsedInput.status).json({ error: parsedInput.error });
  }

  const candidateLimit = parseCandidateLimit(req.body.candidateLimit);

  try {
    const candidatesWithCv = await loadCandidatesWithCvText(candidateLimit);
    if (!candidatesWithCv.length) {
      return res.status(400).json({ error: "Fant ingen kandidater med tilgjengelig CV i databasen." });
    }

    const jobDescriptionText = await getJobDescriptionText(parsedInput);
    const jobProfile = await createJobProfileFromNorLlm(jobDescriptionText);
    const evals = await evaluateCandidatesWithNorLlm({ candidatesWithCv, jobProfile });

    const rankingPrompt = buildRankingPrompt({ jobProfile, evals });
    const rankingText = await callNorLlm(rankingPrompt);
    const ranking = await parseNorLlmJsonWithRepair({
      rawText: rankingText,
      schemaDescription: `{
            "role_title": string,
            "ranking": [{
                "rank": number,
                "candidate_id": string,
                "candidate_label": string,
                "overall_score": number,
                "qualified": boolean,
                "summary": string
            }]
        }`,
      parse: fixRanking,
    });

    const rankingWithFallback =
      ranking.ranking.length > 0
        ? ranking
        : buildFallbackRankingFromEvals({
            jobProfile,
            evals,
            candidatesWithCv,
          });

    const candidates = mapToScreeningCandidates({
      ranking: rankingWithFallback,
      evals,
      candidatesWithCv,
    });

    if (!candidates.length) {
      return res
        .status(400)
        .json({ error: "Fant ingen kandidater som kunne matches mot screeningresultatet." });
    }

    const screeningRecord = buildScreeningRecord({
      jobDescriptionInput: parsedInput,
      jobProfile,
      ranking: rankingWithFallback,
      evals,
      candidatesWithCv,
      jobDescriptionText,
    });

    const requiredSkills = Array.from(
      new Set(
        [...jobProfile.must_haves, ...jobProfile.nice_to_haves]
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );

    const result: RunScreeningResponse = {
      screeningRecord,
      requiredSkills,
      candidates,
    };

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Reads what LLM is to be used and defaults to gemini because it fails in the output less.
 */
function getConfiguredLlm(): "GEMINI" | "NORLLM" {
  const value = (process.env.LLM ?? "GEMINI").trim().toUpperCase();
  return value === "NORLLM" ? "NORLLM" : "GEMINI";
}

export async function runScreening(req: Request, res: Response, next: NextFunction) {
  const provider = getConfiguredLlm();

  if (provider === "NORLLM") {
    return runScreeningWithNorLlm(req, res, next);
  }

  return runScreeningWithGemini(req, res, next);
}
