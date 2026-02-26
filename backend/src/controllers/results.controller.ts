import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query(
      "select job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, summary, created_at from results order by job_post_id, candidate_id desc",
    );
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const job_post_id = Number(req.params.jobPostId);
    const candidate_id = Number(req.params.candidateId);
    const r = await pool.query(
      "select job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, summary, created_at from results where job_post_id=$1 and candidate_id=$2",
      [job_post_id, candidate_id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

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
      summary,
    } = req.body as {
      job_post_id: number;
      candidate_id: number;
      rank: number;
      score: number;
      qualified: boolean;
      qualifications_met: string[];
      qualifications_missing: string[];
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
      "insert into results(job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, summary) values($1, $2, $3, $4, $5, $6, $7, $8) returning job_post_id, candidate_id, rank, score, qualified, qualifications_met, qualifications_missing, summary, created_at",
      [
        job_post_id,
        candidate_id,
        rank,
        score,
        qualified,
        qualifications_met,
        qualifications_missing,
        summary,
      ],
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

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
            'summary', r.summary,
            'createdAt', r.created_at
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
            'summary', r.summary,
            'createdAt', r.created_at
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