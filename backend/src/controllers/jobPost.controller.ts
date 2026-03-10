import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

/**
 * Returns a list of all job posts in descending order by id.
 *
 * Response:
 * - 200: JSON array of job posts
 */
export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query("select id, header, title, description, hardQualifications, softQualifications, created_at from job_posts order by id desc");
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

/**
 * Returns a single job post by id.
 *
 * Responses:
 * - 200: JSON object of the job post
 * - 404: If no job post with the given id exists
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const r = await pool.query("select id, header, title, description, hardQualifications, softQualifications, created_at from job_posts where id=$1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

/**
 * Creates a new job post.
 * 
 * Request should include 'header', 'title', 'description', 'hardQualifications', and 'softQualifications'.
 *
 * Responses:
 * - 201: JSON object of the created job post
 * - 400: If any required fields are missing
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { header, title, description, hardQualifications, softQualifications } = req.body as { header?: string; title?: string; description?: string; hardQualifications?: string; softQualifications?: string };
    if (!header || !title || !description || !hardQualifications || !softQualifications) return res.status(400).json({ error: "header, title, description, hardQualifications, and softQualifications are required" });

    const r = await pool.query(
      "insert into job_posts(header, title, description, hardQualifications, softQualifications) values($1, $2, $3, $4, $5) returning id, header, title, description, hardQualifications, softQualifications, created_at",
      [header, title, description, hardQualifications, softQualifications]
    );

    res.status(201).json(r.rows[0]);
  } catch (e) {
    next(e);
  }
}

