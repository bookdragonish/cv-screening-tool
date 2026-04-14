import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";
import { normalizeString, normalizeStringList as normalizeStringArray } from "../utils/normailizers.js";


/**
 * List all screening results.
 *
 * Response:
 * - 200: JSON array of screening results
 */
export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query(
      "select job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, unknowns, summary, created_at from results order by job_post_id, candidate_id desc",
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

/**
 * Gets single screening result by job post id and candidate id.
 *
 * Request should include 'jobPostId' and 'candidateId'.
 *
 * Responses:
 * - 200: JSON object of the screening result
 * - 404: If no screening result with the given job post id and candidate id exists
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const job_post_id = Number(req.params.jobPostId);
    const candidate_id = Number(req.params.candidateId);
    const r = await pool.query(
      "select job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, unknowns, summary, created_at from results where job_post_id=$1 and candidate_id=$2",
      [job_post_id, candidate_id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

/**
 * Creates a new screening result.
 *
 * Request should include 'job_post_id', 'candidate_id', 'rank', 'score', 'qualified', 'qualifications_met', and 'qualifications_missing'. 'summary' is optional.
 *
 * Responses:
 * - 201: JSON object of the created screening result
 * - 400: If any required fields are missing
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      job_post_id,
      candidate_id,
      rank,
      score,
      qualified,
      qualifications_met,
      qualifications_missing,
      unknowns = [],
      summary,
    } = req.body as {
      job_post_id: number;
      candidate_id: number;
      rank: number;
      score: number;
      qualified: boolean;
      qualifications_met: string[];
      qualifications_missing: string[];
      unknowns?: string[];
      summary?: string;
    };

    if (
      !job_post_id ||
      !candidate_id ||
      rank === null || rank === undefined ||
      score === null || score === undefined ||
      qualified === null || qualified === undefined ||
      !Array.isArray(qualifications_met) ||
      !Array.isArray(qualifications_missing)
    )
      return res
        .status(400)
        .json({
          error:
            "job_post_id, candidate_id, rank, score, qualified, qualifications_met, and qualifications_missing are required",
        });

    const r = await pool.query(
      "insert into results(job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, unknowns, summary) values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, unknowns, summary, created_at",
      [
        job_post_id,
        candidate_id,
        rank,
        score,
        qualified,
        qualifications_met,
        qualifications_missing,
        unknowns,
        summary,
      ],
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

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
      hardQualifications?: unknown;
      softQualifications?: unknown;
      candidates?: Array<{
        candidateId?: number;
        rank?: number;
        score?: number;
        qualified?: boolean;
        qualificationsMet?: unknown;
        qualificationsMissing?: unknown;
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
      qualificationsMet: normalizeStringArray(candidate.qualificationsMet),
      qualificationsMissing: normalizeStringArray(candidate.qualificationsMissing),
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
        normalizedHardQualifications.join("\n"),
        normalizedSoftQualifications.join("\n"),
      ],
    );

    const createdJobPost = jobPostResult.rows[0] as {
      id: number;
      title: string;
      created_at: string;
    };

    for (const candidate of normalizedCandidates) {
      await client.query(
        "insert into results(job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, unknowns, summary) values($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          createdJobPost.id,
          candidate.candidateId,
          candidate.rank,
          candidate.score,
          candidate.qualified,
          candidate.qualificationsMet,
          candidate.qualificationsMissing,
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
 * Gets screening history for all job posts that have been screened, including the top 3 candidates for each job post.
 *
 * Response:
 * - 200: JSON array of screening history, where each item includes 'jobPostId', 'title', 'screenedAt', and 'candidates' (array of top 3 candidates with their screening results)
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
            'qualificationsMet', r.qualifications_met,
            'qualificationsMissing', r.qualifications_missing,
            'unknowns', r.unknowns,
            'summary', r.summary,
            'createdAt', r.created_at,
            'aml46', c.aml46,
            'aml47', c.aml47
          ) ORDER BY r.rank
        ) FILTER (WHERE r.rank <= 3) as candidates
      FROM job_posts jp
      LEFT JOIN results r ON jp.id = r.job_post_id AND r.rank <= 3
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
        json_agg(
          json_build_object(
            'candidateId', c.id,
            'candidateName', c.name,
            'rank', r.rank,
            'score', r.score,
            'qualified', r.qualified,
            'qualificationsMet', r.qualifications_met,
            'qualificationsMissing', r.qualifications_missing,
            'unknowns', r.unknowns,
            'summary', r.summary,
            'createdAt', r.created_at,
            'aml46', c.aml46,
            'aml47', c.aml47
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
 * Deletes a screening result by job post id and candidate id combined as the primary key.
 *
 * Request should include 'jobPostId' and 'candidateId' as URL parameters.
 *
 * Responses:
 * - 204: If the screening result was successfully deleted
 * - 404: If no screening result with the given job post id and candidate id exists
 */
export async function deleteById(req: Request, res: Response, next: NextFunction) {
  try {
    const job_post_id = Number(req.params.jobPostId);
    const candidate_id = Number(req.params.candidateId);
    const r = await pool.query("delete from results where job_post_id=$1 and candidate_id=$2", [job_post_id, candidate_id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
