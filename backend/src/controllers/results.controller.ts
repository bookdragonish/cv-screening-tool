import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";
import { normalizeString, normalizeStringList as normalizeStringArray } from "../utils/normailizers.js";

/**
 * Creates a persisted screening run by inserting one job post row and its
 * candidate result rows in a single transaction.
 *
 * Request should include 'title', 'description', 'hardQualifications', 'softQualifications',
 * and 'candidates'.
 *
 * Responses:
 * - 201: JSON object with the created job post id
 * - 400: If any required fields are missing or invalid
 */
export async function createScreeningRun(req: Request, res: Response, next: NextFunction) {
  const client = await pool.connect();

  try {
    const {
      title,
      header,
      description,
      hardQualifications,
      softQualifications,
      candidates,
    } = req.body as {
      title?: string;
      header?: string;
      description?: string;
      hardQualifications?: string[];
      softQualifications?: string[];
      candidates?: Array<{
        candidateId?: number;
        rank?: number;
        score?: number;
        qualified?: boolean;
        qualifications_met?: unknown;
        qualifications_missing?: unknown;
        course_recommendations?: unknown;
        unknowns?: unknown;
        summary?: string;
      }>;
    };

    const normalizedTitle = normalizeString(title);
    const normalizedHeader = normalizeString(header) || normalizedTitle;
    const normalizedDescription = normalizeString(description);
    const normalizedHardQualifications = normalizeStringArray(hardQualifications);
    const normalizedSoftQualifications = normalizeStringArray(softQualifications);

    if (!normalizedTitle || !normalizedDescription || !Array.isArray(candidates) || !candidates.length) {
      return res.status(400).json({
        error: "title, description, and at least one candidate are required",
      });
    }

    const normalizedCandidates = candidates.map((candidate) => ({
      candidateId: Number(candidate.candidateId),
      rank: Number(candidate.rank),
      score: Number(candidate.score),
      qualified: candidate.qualified,
      qualifications_met: normalizeStringArray(candidate.qualifications_met),
      qualifications_missing: normalizeStringArray(candidate.qualifications_missing),
      course_recommendations: normalizeStringArray(candidate.course_recommendations),
      unknowns: normalizeStringArray(candidate.unknowns),
      summary: normalizeString(candidate.summary),
    }));

    const hasInvalidCandidate = normalizedCandidates.some((candidate) => (
      !Number.isInteger(candidate.candidateId) ||
      candidate.candidateId <= 0 ||
      !Number.isInteger(candidate.rank) ||
      candidate.rank <= 0 ||
      Number.isNaN(candidate.score) ||
      typeof candidate.qualified !== "boolean"
    ));

    if (hasInvalidCandidate) {
      return res.status(400).json({
        error: "each candidate must include candidateId, rank, score, and qualified",
      });
    }

    await client.query("begin");

    const jobPostResult = await client.query(
      "insert into job_posts(header, title, description, hardQualifications, softQualifications) values($1, $2, $3, $4, $5) returning id, title, created_at",
      [
        normalizedHeader,
        normalizedTitle,
        normalizedDescription,
        normalizedHardQualifications,
        normalizedSoftQualifications,
      ],
    );

    const createdJobPost = jobPostResult.rows[0] as {
      id: number;
      title: string;
      created_at: string;
    };

    for (const candidate of normalizedCandidates) {
      await client.query(
        "insert into results(job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, course_recommendations, unknowns, summary) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [
          createdJobPost.id,
          candidate.candidateId,
          candidate.rank,
          candidate.score,
          candidate.qualified,
          candidate.qualifications_met,
          candidate.qualifications_missing,
          candidate.course_recommendations,
          candidate.unknowns,
          candidate.summary || null,
        ],
      );
    }

    await client.query("commit");

    res.status(201).json({
      jobPostId: createdJobPost.id,
      title: createdJobPost.title,
      screenedAt: createdJobPost.created_at,
    });
  } catch (e) {
    await client.query("rollback").catch(() => undefined);
    next(e);
  } finally {
    client.release();
  }
}

/**
 * Gets screening history for all job posts that have been screened.
 *
 * Response:
 * - 200: JSON array of screening history, where each item includes 'jobPostId', 'title', 'screenedAt', and 'candidates' (array of all candidates with their screening results)
 */
export async function getScreeningHistory(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query(
      `SELECT
        jp.id as "jobPostId",
        jp.title,
        jp.created_at as "screenedAt",
        json_agg(
          json_build_object(
            'candidateId', c.id,
            'candidateName', c.name,
            'rank', r.rank,
            'score', r.score,
            'qualified', r.qualified,
            'qualifications_met', r.qualifications_met,
            'qualifications_missing', r.qualifications_missing,
            'course_recommendations', r.course_recommendations,
            'unknowns', r.unknowns,
            'summary', r.summary,
            'createdAt', r.created_at,
            'aml46', c.aml46,
            'aml47', c.aml47,
            'ansiennitet', c.ansiennitet,
            'hasPdf', (c.cv_pdf IS NOT NULL)
          ) ORDER BY r.rank
        ) as candidates
      FROM job_posts jp
      LEFT JOIN results r ON jp.id = r.job_post_id
      LEFT JOIN candidates c ON r.candidate_id = c.id
      WHERE jp.id IN (SELECT DISTINCT job_post_id FROM results)
      GROUP BY jp.id, jp.title, jp.created_at
      ORDER BY jp.created_at DESC`,
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

/**
 * Gets all candidates that have been screened for a specific job post.
 *
 * Request should include 'jobPostId' as a URL parameter.
 *
 * Responses:
 * - 200: JSON object including 'jobPostId', 'title', 'screenedAt', and 'candidates' (array of all candidates with their screening results)
 * - 404: If no job post with the given id exists
 */
export async function getScreeningByJobPostId(req: Request, res: Response, next: NextFunction) {
  try {
    const job_post_id = Number(req.params.jobPostId);
    const r = await pool.query(
      `SELECT
        jp.id as "jobPostId",
        jp.title,
        jp.created_at as "screenedAt",
        jp.hardqualifications as "hardQualifications",
        jp.softqualifications as "softQualifications",
        json_agg(
          json_build_object(
            'candidateId', c.id,
            'candidateName', c.name,
            'rank', r.rank,
            'score', r.score,
            'qualified', r.qualified,
            'qualifications_met', r.qualifications_met,
            'qualifications_missing', r.qualifications_missing,
            'course_recommendations', r.course_recommendations,
            'unknowns', r.unknowns,
            'summary', r.summary,
            'createdAt', r.created_at,
            'aml46', c.aml46,
            'aml47', c.aml47,
            'ansiennitet', c.ansiennitet,
            'hasPdf', (c.cv_pdf IS NOT NULL)
          ) ORDER BY r.rank
        ) as candidates
      FROM job_posts jp
      LEFT JOIN results r ON jp.id = r.job_post_id
      LEFT JOIN candidates c ON r.candidate_id = c.id
      WHERE jp.id = $1
      GROUP BY jp.id, jp.title, jp.created_at`,
      [job_post_id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Job post not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

/**
 * Gets all screenings a specific candidate has participated in.
 *
 * Request should include 'candidateId' as a URL parameter.
 *
 * Responses:
 * - 200: JSON array where each item includes 'jobPostId', 'title', 'screenedAt', 'candidateResult', and 'totalCandidates'
 */
export async function getScreeningByCandidateId(req: Request, res: Response, next: NextFunction) {
  try {
    const candidate_id = Number(req.params.candidateId);
    const r = await pool.query(
      `SELECT
        jp.id as "jobPostId",
        jp.title,
        jp.created_at as "screenedAt",
        json_build_object(
          'candidateId', c.id,
          'candidateName', c.name,
          'rank', r.rank,
          'score', r.score,
          'qualified', r.qualified,
          'qualifications_met', r.qualifications_met,
          'qualifications_missing', r.qualifications_missing,
          'course_recommendations', r.course_recommendations,
          'unknowns', r.unknowns,
          'summary', r.summary,
          'createdAt', r.created_at,
          'aml46', c.aml46,
          'aml47', c.aml47,
          'ansiennitet', c.ansiennitet,
          'hasPdf', (c.cv_pdf IS NOT NULL)
        ) as "candidateResult",
        (SELECT COUNT(*) FROM results r2 WHERE r2.job_post_id = jp.id)::int as "totalCandidates"
      FROM results r
      JOIN job_posts jp ON r.job_post_id = jp.id
      JOIN candidates c ON r.candidate_id = c.id
      WHERE r.candidate_id = $1
      ORDER BY jp.created_at DESC`,
      [candidate_id],
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

