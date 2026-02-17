import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const r = await pool.query("select id, header, title, description, hardQualifications, softQualifications, created_at from job_posts order by id desc");
    res.json(r.rows);
  } catch (e) {
    next(e);
  }
}

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

